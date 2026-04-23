package com.ICom.Icom.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PanierResponseDTO {

    // id du panier
    private Long id;

    // liste des produits dans le panier
    private List<LignePanierResponseDTO> lignes;

    // montant total du panier
    private double total;
}