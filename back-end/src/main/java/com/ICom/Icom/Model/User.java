package com.ICom.Icom.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUser;

    private String nom;

    private String prenom;

    @NotBlank(message = "Username est obligatoire")
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    @Column(nullable = false)
    private String motdepasse;

    @Enumerated(EnumType.STRING)  // Important : mappe l'enum comme String en BDD
    @Column(nullable = false)
    private Role role;

    private String tel;

    @Enumerated(EnumType.STRING)  // Important : mappe l'enum comme String en BDD
    @Column(nullable = false)
    private Status status;
}
