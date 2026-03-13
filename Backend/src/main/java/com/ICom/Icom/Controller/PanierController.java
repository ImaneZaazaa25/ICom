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

    // GET /api/panier → voir mon panier (créé automatiquement si inexistant)
    @GetMapping
    public ResponseEntity<PanierResponseDTO> getPanier(Authentication authentication) {
        return ResponseEntity.ok(panierService.getPanier(authentication.getName()));
    }

    // POST /api/panier/items → ajouter un produit { "produitId": 1, "quantite": 2 }
    @PostMapping("/items")
    public ResponseEntity<PanierResponseDTO> ajouterProduit(
            Authentication authentication,
            @Valid @RequestBody AjoutPanierDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(panierService.ajouterProduit(authentication.getName(), dto));
    }

    // PUT /api/panier/items/{ligneId} → modifier la quantité { "quantite": 5 }
    @PutMapping("/items/{ligneId}")
    public ResponseEntity<PanierResponseDTO> modifierQuantite(
            Authentication authentication,
            @PathVariable Long ligneId,
            @Valid @RequestBody ModifierQuantiteDTO dto) {
        return ResponseEntity.ok(panierService.modifierQuantite(authentication.getName(), ligneId, dto));
    }

    // DELETE /api/panier/items/{ligneId} → supprimer une ligne du panier
    @DeleteMapping("/items/{ligneId}")
    public ResponseEntity<PanierResponseDTO> supprimerLigne(
            Authentication authentication,
            @PathVariable Long ligneId) {
        return ResponseEntity.ok(panierService.supprimerLigne(authentication.getName(), ligneId));
    }
}
