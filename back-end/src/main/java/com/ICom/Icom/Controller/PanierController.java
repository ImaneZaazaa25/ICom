package com.ICom.Icom.Controller;

import com.ICom.Icom.DTO.AjoutPanierDTO;
import com.ICom.Icom.DTO.ModifierQuantiteDTO;
import com.ICom.Icom.DTO.PanierResponseDTO;
import com.ICom.Icom.Service.PanierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/panier")
@RequiredArgsConstructor
public class PanierController {

    private final PanierService panierService;

    // =====================================================
    // RÉCUPÉRER LE PANIER DE L'UTILISATEUR
    // =====================================================
    // - Retourne le panier de l'utilisateur connecté
    // - Si le panier n'existe pas, il est créé automatiquement (côté service)
    @GetMapping
    public ResponseEntity<PanierResponseDTO> getPanier(Authentication authentication) {
        return ResponseEntity.ok(panierService.getPanier(authentication.getName()));
    }

    // =====================================================
    // AJOUTER UN PRODUIT AU PANIER
    // =====================================================
    // - Body attendu : AjoutPanierDTO { produitId, quantite }
    // - Crée une nouvelle ligne ou augmente la quantité si déjà présent
    @PostMapping("/items")
    public ResponseEntity<PanierResponseDTO> ajouterProduit(
            Authentication authentication,
            @Valid @RequestBody AjoutPanierDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(panierService.ajouterProduit(authentication.getName(), dto));
    }

    // =====================================================
    // MODIFIER LA QUANTITÉ D'UN PRODUIT DANS LE PANIER
    // =====================================================
    // - Identifié par ligneId (id de la ligne du panier)
    // - Body : ModifierQuantiteDTO { quantite }
    @PutMapping("/items/{ligneId}")
    public ResponseEntity<PanierResponseDTO> modifierQuantite(
            Authentication authentication,
            @PathVariable Long ligneId,
            @Valid @RequestBody ModifierQuantiteDTO dto) {

        return ResponseEntity.ok(
                panierService.modifierQuantite(authentication.getName(), ligneId, dto)
        );
    }

    // =====================================================
    // SUPPRIMER UNE LIGNE DU PANIER
    // =====================================================
    // - Supprime un produit du panier via son ligneId
    @DeleteMapping("/items/{ligneId}")
    public ResponseEntity<PanierResponseDTO> supprimerLigne(
            Authentication authentication,
            @PathVariable Long ligneId) {

        return ResponseEntity.ok(
                panierService.supprimerLigne(authentication.getName(), ligneId)
        );
    }
}