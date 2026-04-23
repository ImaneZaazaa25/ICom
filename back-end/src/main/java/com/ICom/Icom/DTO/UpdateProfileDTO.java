package com.ICom.Icom.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateProfileDTO {

    // nom de l'utilisateur
    private String nom;

    // prénom de l'utilisateur
    private String prenom;

    // email avec validation de format
    @Email(message = "Format d'email invalide")
    private String email;

    // numéro de téléphone
    private String tel;

    // mot de passe (optionnel)
    // mis à jour seulement s'il est fourni
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String motdepasse;
}