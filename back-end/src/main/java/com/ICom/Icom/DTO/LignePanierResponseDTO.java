package com.ICom.Icom.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LignePanierResponseDTO {

    // id de la ligne du panier
    private Long id;

    // id du produit
    private Long produitId;

    // nom du produit affiché dans le panier
    private String nomProduit;

    // quantité du produit dans le panier
    private int quantite;

    // prix unitaire du produit
    private double prixUnitaire;

    // total de la ligne (quantité * prix unitaire)
    private double sousTotal;
}