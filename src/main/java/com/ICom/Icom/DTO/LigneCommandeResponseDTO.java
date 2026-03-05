package com.ICom.Icom.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LigneCommandeResponseDTO {
    private Long id;
    private Long produitId;
    private String nomProduit;
    private int quantite;
    private double prixUnitaire;
    private double sousTotal;
}
