package com.ICom.Icom.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AjoutPanierDTO {

    // =====================================================
    // ID DU PRODUIT À AJOUTER AU PANIER
    // =====================================================
    // - Champ obligatoire
    // - Permet d’identifier le produit à ajouter
    @NotNull(message = "Le produitId est obligatoire")
    private Long produitId;

    // =====================================================
    // QUANTITÉ DU PRODUIT
    // =====================================================
    // - Doit être au minimum 1
    // - Empêche les valeurs nulles ou invalides (0 ou négatif)
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private int quantite;
}