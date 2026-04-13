package com.ICom.Icom.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "panier")
@Getter
@Setter
@NoArgsConstructor
public class Panier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Un panier appartient à un seul utilisateur
    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User client;

    // Colonne exigée NOT NULL par la DB — la valeur réelle est calculée dans buildDTO()
    @Column(name = "total", nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    // orphanRemoval = true : si on supprime une ligne du panier, elle est supprimée en BDD
    @OneToMany(mappedBy = "panier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LignePanier> lignes = new ArrayList<>();
}
/*
On ne stocke PAS une donnée qui peut être calculée.

Pourquoi ?

Parce que sinon :

❌ Risque d’incohérence

❌ Si une ligne change et on oublie de mettre à jour total → erreur

❌ Double source de vérité

il est calculé dans le Service

envoyé dans le PanierResponseDTO
*/
