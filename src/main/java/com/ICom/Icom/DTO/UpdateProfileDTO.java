package com.ICom.Icom.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateProfileDTO {
    private String nom;
    private String prenom;

    @Email(message = "Format d'email invalide")
    private String email;

    private String tel;

    // Optionnel : seulement mis à jour si fourni et non vide
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String motdepasse;
}
