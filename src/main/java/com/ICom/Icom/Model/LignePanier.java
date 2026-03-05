package com.ICom.Icom.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ligne_panier")
@Getter
@Setter
@NoArgsConstructor
public class LignePanier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @JsonIgnore évite la boucle infinie Panier → LignePanier → Panier lors de la sérialisation
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "panier_id", nullable = false)
    private Panier panier;

    @ManyToOne
    @JoinColumn(name = "produit_id", nullable = false)
    private Product produit;

    private int quantite;

    // Prix capturé au moment de l'ajout (snapshots si le prix change ensuite)
    private double prixUnitaire;
}
