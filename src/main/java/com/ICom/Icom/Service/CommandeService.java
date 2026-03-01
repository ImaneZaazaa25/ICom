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

    public CommandeResponseDTO validerPanier(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("Utilisateur non trouvé : " + username);
        }

        Panier panier = panierRepository.findByClientUsername(username)
                .orElseThrow(() -> new RuntimeException("Aucun panier trouvé. Ajoutez des produits d'abord."));

        List<LignePanier> lignes = lignePanierRepository.findByPanierId(panier.getId());
        if (lignes.isEmpty()) {
            throw new RuntimeException("Le panier est vide. Ajoutez des produits avant de valider.");
        }

        // === PHASE 1 : Vérification globale avant de modifier quoi que ce soit ===
        for (LignePanier ligne : lignes) {
            Product produit = ligne.getProduit();
            if (!produit.isStatut()) {
                throw new ProduitInactifException(
                        "Le produit \"" + produit.getNom() + "\" n'est plus disponible. "
                        + "Retirez-le de votre panier avant de valider.");
            }
            if (produit.getQuantite() < ligne.getQuantite()) {
                throw new StockInsuffisantException(
                        "Stock insuffisant pour \"" + produit.getNom() + "\". "
                        + "Disponible : " + produit.getQuantite()
                        + ", dans votre panier : " + ligne.getQuantite());
            }
        }

        // === PHASE 2 : Création de la commande ===
        Commande commande = new Commande();
        commande.setClient(user);
        commande.setDateCommande(new Date());
        commande.setEtat(EtatCommande.VALIDEE);
        commandeRepository.save(commande);

        double total = 0;

        // === PHASE 3 : Création des lignes + décrémentation stock ===
        for (LignePanier lp : lignes) {
            Product produit = lp.getProduit();

            LigneCommande lc = new LigneCommande();
            lc.setCommande(commande);
            lc.setProduit(produit);
            lc.setQuantite(lp.getQuantite());
            lc.setPrixUnitaire(lp.getPrixUnitaire()); // snapshot du prix au moment de l'achat
            ligneCommandeRepository.save(lc);

            // Décrémentation du stock
            produit.setQuantite(produit.getQuantite() - lp.getQuantite());
            productRepository.save(produit);

            total += lp.getPrixUnitaire() * lp.getQuantite();
        }

        // Sauvegarder le total dans la commande (snapshot)
        commande.setTotal(total);
        commandeRepository.save(commande);

        // === PHASE 4 : Vider le panier ===
        lignePanierRepository.deleteAll(lignes);

        return buildDTO(commande);
    }

    @Transactional(readOnly = true)
    public List<CommandeResponseDTO> getMesCommandes(String username) {
        return commandeRepository.findByClientUsername(username).stream()
                .map(this::buildDTO)
                .toList();
    }

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
