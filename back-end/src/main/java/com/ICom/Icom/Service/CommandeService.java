package com.ICom.Icom.Service;

import com.ICom.Icom.DTO.CommandeResponseDTO;
import com.ICom.Icom.DTO.LigneCommandeResponseDTO;
import com.ICom.Icom.Exception.ProduitInactifException;
import com.ICom.Icom.Exception.ResourceNotFoundException;
import com.ICom.Icom.Exception.StockInsuffisantException;
import com.ICom.Icom.Model.*;
import com.ICom.Icom.Repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final LigneCommandeRepository ligneCommandeRepository;
    private final PanierRepository panierRepository;
    private final LignePanierRepository lignePanierRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // validation du panier et création d'une commande
    public CommandeResponseDTO validerPanier(String username) {

        // récupération utilisateur
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("Utilisateur non trouvé : " + username);
        }

        // récupération panier utilisateur
        Panier panier = panierRepository.findByClientUsername(username)
                .orElseThrow(() -> new RuntimeException("Aucun panier trouvé. Ajoutez des produits d'abord."));

        List<LignePanier> lignes = lignePanierRepository.findByPanierId(panier.getId());

        // vérifie que le panier n'est pas vide
        if (lignes.isEmpty()) {
            throw new RuntimeException("Le panier est vide. Ajoutez des produits avant de valider.");
        }

        // vérification des produits avant traitement
        for (LignePanier ligne : lignes) {

            Product produit = ligne.getProduit();

            // produit inactif
            if (!produit.isStatut()) {
                throw new ProduitInactifException(
                        "Le produit \"" + produit.getNom() + "\" n'est plus disponible. " +
                                "Retirez-le de votre panier avant de valider."
                );
            }

            // stock insuffisant
            if (produit.getQuantite() < ligne.getQuantite()) {
                throw new StockInsuffisantException(
                        "Stock insuffisant pour \"" + produit.getNom() + "\". " +
                                "Disponible : " + produit.getQuantite() +
                                ", demandé : " + ligne.getQuantite()
                );
            }
        }

        // création de la commande
        Commande commande = new Commande();
        commande.setClient(user);
        commande.setDateCommande(new Date());
        commande.setEtat(EtatCommande.EN_COURS);

        commande = commandeRepository.save(commande);

        double total = 0;

        // création des lignes de commande + mise à jour stock
        for (LignePanier lp : lignes) {

            Product produit = lp.getProduit();

            LigneCommande lc = new LigneCommande();
            lc.setCommande(commande);
            lc.setProduit(produit);
            lc.setQuantite(lp.getQuantite());
            lc.setPrixUnitaire(lp.getPrixUnitaire());

            ligneCommandeRepository.save(lc);

            // décrémentation du stock
            produit.setQuantite(produit.getQuantite() - lp.getQuantite());
            productRepository.save(produit);

            total += lp.getPrixUnitaire() * lp.getQuantite();
        }

        // mise à jour finale de la commande
        commande.setTotal(total);
        commande.setEtat(EtatCommande.VALIDEE);

        commande = commandeRepository.save(commande);

        // vider le panier après validation
        lignePanierRepository.deleteAll(lignes);

        return buildDTO(commande);
    }

    // récupération des commandes utilisateur
    @Transactional(readOnly = true)
    public List<CommandeResponseDTO> getMesCommandes(String username) {
        return commandeRepository.findByClientUsername(username)
                .stream()
                .map(this::buildDTO)
                .toList();
    }

    // transformation entity -> DTO
    private CommandeResponseDTO buildDTO(Commande commande) {

        List<LigneCommande> lignes = ligneCommandeRepository.findByCommandeId(commande.getId());

        List<LigneCommandeResponseDTO> lignesDTO = lignes.stream()
                .map(l -> new LigneCommandeResponseDTO(
                        l.getId(),
                        l.getProduit().getId(),
                        l.getProduit().getNom(),
                        l.getQuantite(),
                        l.getPrixUnitaire(),
                        l.getPrixUnitaire() * l.getQuantite()
                ))
                .toList();

        return new CommandeResponseDTO(
                commande.getId(),
                commande.getDateCommande(),
                commande.getEtat(),
                lignesDTO,
                commande.getTotal()
        );
    }
}