package com.ICom.Icom.Controller;

import com.ICom.Icom.DTO.UpdateProfileDTO;
import com.ICom.Icom.DTO.UserProfileDTO;
import com.ICom.Icom.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // =====================================================
    // RÉCUPÉRER LE PROFIL DE L'UTILISATEUR CONNECTÉ
    // =====================================================
    // - Utilise le JWT (Authentication) pour identifier l'utilisateur
    // - Récupère les informations depuis la base de données
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfil(Authentication authentication) {
        return ResponseEntity.ok(
                userService.getProfil(authentication.getName())
        );
    }

    // =====================================================
    // METTRE À JOUR LE PROFIL UTILISATEUR
    // =====================================================
    // - Permet de modifier les informations personnelles
    // - Ex: nom, email, mot de passe, etc.
    // - Validation automatique via @Valid
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateProfil(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileDTO dto) {

        return ResponseEntity.ok(
                userService.updateProfil(authentication.getName(), dto)
        );
    }
}