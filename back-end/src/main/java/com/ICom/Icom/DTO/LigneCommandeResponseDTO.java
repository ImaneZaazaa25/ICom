package com.ICom.Icom.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LigneCommandeResponseDTO {

    // id de la ligne de commande
    private Long id;

    // id du produit
    private Long produitId;

    // nom du produit affiché dans la commande
    private String nomProduit;

    // quantité commandée
    private int quantite;

    // prix unitaire du produit au moment de la commande
    private double prixUnitaire;

    // total de la ligne (quantité * prix unitaire)
    private double sousTotal;
}