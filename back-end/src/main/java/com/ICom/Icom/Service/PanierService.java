package com.ICom.Icom.Service;

import com.ICom.Icom.DTO.AjoutPanierDTO;
import com.ICom.Icom.DTO.LignePanierResponseDTO;
import com.ICom.Icom.DTO.ModifierQuantiteDTO;
import com.ICom.Icom.DTO.PanierResponseDTO;
import com.ICom.Icom.Exception.ProduitInactifException;
import com.ICom.Icom.Exception.ResourceNotFoundException;
import com.ICom.Icom.Exception.StockInsuffisantException;
import com.ICom.Icom.Model.LignePanier;
import com.ICom.Icom.Model.Panier;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Model.User;
import com.ICom.Icom.Repositories.LignePanierRepository;
import com.ICom.Icom.Repositories.PanierRepository;
import com.ICom.Icom.Repositories.ProductRepository;
import com.ICom.Icom.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PanierService {

    private final PanierRepository panierRepository;
    private final LignePanierRepository lignePanierRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // Récupère le panier ou le crée si c'est la première fois
    private Panier getOrCreatePanier(String username) {
        return panierRepository.findByClientUsername(username)
                .orElseGet(() -> {
                    User user = userRepository.findByUsername(username);
                    if (user == null) {
                        throw new ResourceNotFoundException("Utilisateur non trouvé : " + username);
                    }
                    Panier nouveau = new Panier();
                    nouveau.setClient(user);
                    return panierRepository.save(nouveau);
                });
    }

    public PanierResponseDTO getPanier(String username) {
        Panier panier = getOrCreatePanier(username);
        return buildDTO(panier);
    }

    public PanierResponseDTO ajouterProduit(String username, AjoutPanierDTO dto) {
        Panier panier = getOrCreatePanier(username);

        Product produit = productRepository.findById(dto.getProduitId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Produit non trouvé avec l'id : " + dto.getProduitId()));

        // Règle : produit inactif → refus
        if (!produit.isStatut()) {
            throw new ProduitInactifException(
                    "Le produit \"" + produit.getNom() + "\" est inactif et ne peut pas être ajouté au panier.");
        }

        // Le produit est-il déjà dans le panier ?
        List<LignePanier> lignesExistantes = lignePanierRepository.findByPanierId(panier.getId());
        Optional<LignePanier> ligneExistante = lignesExistantes.stream()
                .filter(l -> l.getProduit().getId().equals(dto.getProduitId()))
                .findFirst();

        if (ligneExistante.isPresent()) {
            // On cumule la quantité et on vérifie le stock total
            LignePanier ligne = ligneExistante.get();
            int nouvelleQte = ligne.getQuantite() + dto.getQuantite();
            if (produit.getQuantite() < nouvelleQte) {
                throw new StockInsuffisantException(
                        "Stock insuffisant pour \"" + produit.getNom() + "\". "
                        + "Disponible : " + produit.getQuantite()
                        + ", demandé au total : " + nouvelleQte);
            }
            ligne.setQuantite(nouvelleQte);
            lignePanierRepository.save(ligne);
        } else {
            // Vérification stock pour un nouvel ajout
            if (produit.getQuantite() < dto.getQuantite()) {
                throw new StockInsuffisantException(
                        "Stock insuffisant pour \"" + produit.getNom() + "\". "
                        + "Disponible : " + produit.getQuantite());
            }
            LignePanier nouvelle = new LignePanier();
            nouvelle.setPanier(panier);
            nouvelle.setProduit(produit);
            nouvelle.setQuantite(dto.getQuantite());
            nouvelle.setPrixUnitaire(produit.getPrix()); // snapshot du prix actuel
            lignePanierRepository.save(nouvelle);
        }

        return buildDTO(panier);
    }

    public PanierResponseDTO modifierQuantite(String username, Long ligneId, ModifierQuantiteDTO dto) {
        Panier panier = getOrCreatePanier(username);

        LignePanier ligne = lignePanierRepository.findById(ligneId)
                .orElseThrow(() -> new ResourceNotFoundException("Ligne panier non trouvée : " + ligneId));

        // Sécurité : la ligne doit appartenir au panier du user connecté
        if (!ligne.getPanier().getId().equals(panier.getId())) {
            throw new AccessDeniedException("Vous ne pouvez pas modifier cette ligne.");
        }

        // Vérification stock
        if (ligne.getProduit().getQuantite() < dto.getQuantite()) {
            throw new StockInsuffisantException(
                    "Stock insuffisant pour \"" + ligne.getProduit().getNom() + "\". "
                    + "Disponible : " + ligne.getProduit().getQuantite());
        }

        ligne.setQuantite(dto.getQuantite());
        lignePanierRepository.save(ligne);

        return buildDTO(panier);
    }

    public PanierResponseDTO supprimerLigne(String username, Long ligneId) {
        Panier panier = getOrCreatePanier(username);

        LignePanier ligne = lignePanierRepository.findById(ligneId)
                .orElseThrow(() -> new ResourceNotFoundException("Ligne panier non trouvée : " + ligneId));

        // Sécurité : appartenance au panier du user connecté
        if (!ligne.getPanier().getId().equals(panier.getId())) {
            throw new AccessDeniedException("Vous ne pouvez pas supprimer cette ligne.");
        }

        lignePanierRepository.delete(ligne);

        return buildDTO(panier);
    }

    // Construit le DTO en relisant les lignes fraîches depuis la BDD
    private PanierResponseDTO buildDTO(Panier panier) {
        List<LignePanier> lignes = lignePanierRepository.findByPanierId(panier.getId());

        List<LignePanierResponseDTO> lignesDTO = lignes.stream()
                .map(l -> new LignePanierResponseDTO(
                        l.getId(),
                        l.getProduit().getId(),
                        l.getProduit().getNom(),
                        l.getQuantite(),
                        l.getPrixUnitaire(),
                        l.getPrixUnitaire() * l.getQuantite()
                ))
                .toList();

        double total = lignesDTO.stream()
                .mapToDouble(LignePanierResponseDTO::getSousTotal)
                .sum();

        return new PanierResponseDTO(panier.getId(), lignesDTO, total);
    }
}
