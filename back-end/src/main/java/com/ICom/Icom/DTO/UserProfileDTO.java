package com.ICom.Icom.DTO;

import com.ICom.Icom.Model.Role;
import com.ICom.Icom.Model.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {

    // id de l'utilisateur
    private Long idUser;

    // nom de l'utilisateur
    private String nom;

    // prénom de l'utilisateur
    private String prenom;

    // username utilisé pour la connexion
    private String username;

    // email de l'utilisateur
    private String email;

    // numéro de téléphone
    private String tel;

    // rôle de l'utilisateur (ADMIN, USER, etc.)
    private Role role;

    // statut du compte (ACTIF, BLOQUÉ, etc.)
    private Status status;
}