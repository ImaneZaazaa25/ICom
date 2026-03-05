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

    // POST /api/commandes → valider le panier : crée la commande, vide le panier, décrémente le stock
    @PostMapping
    public ResponseEntity<CommandeResponseDTO> validerPanier(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commandeService.validerPanier(authentication.getName()));
    }

    // GET /api/commandes → historique de mes commandes
    @GetMapping
    public ResponseEntity<List<CommandeResponseDTO>> getMesCommandes(Authentication authentication) {
        return ResponseEntity.ok(commandeService.getMesCommandes(authentication.getName()));
    }
}
