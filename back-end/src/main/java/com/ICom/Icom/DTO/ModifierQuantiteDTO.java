package com.ICom.Icom.DTO;

import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ModifierQuantiteDTO {

    // quantité du produit dans le panier
    // doit être au minimum 1
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private int quantite;
}