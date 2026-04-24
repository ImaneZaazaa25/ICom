package com.ICom.Icom.Controller;

import com.ICom.Icom.DTO.CommandeResponseDTO;
import com.ICom.Icom.Service.CommandeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commandes")
@RequiredArgsConstructor
public class CommandeController {

    private final CommandeService commandeService;

    // ==========================================
    // VALIDER LE PANIER (CRÉER UNE COMMANDE)
    // ==========================================
    // - Récupère l'utilisateur connecté via Authentication
    // - Crée une commande à partir du panier
    // - Vide le panier
    // - Décrémente le stock des produits
    @PostMapping
    public ResponseEntity<CommandeResponseDTO> validerPanier(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commandeService.validerPanier(authentication.getName()));
    }

    // ==========================================
    // OBTENIR L'HISTORIQUE DES COMMANDES
    // ==========================================
    // - Retourne toutes les commandes de l'utilisateur connecté
    @GetMapping
    public ResponseEntity<List<CommandeResponseDTO>> getMesCommandes(Authentication authentication) {
        return ResponseEntity.ok(commandeService.getMesCommandes(authentication.getName()));
    }
}