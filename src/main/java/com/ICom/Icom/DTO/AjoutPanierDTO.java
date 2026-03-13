package com.ICom.Icom.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AjoutPanierDTO {

    @NotNull(message = "Le produitId est obligatoire")
    private Long produitId;

    @Min(value = 1, message = "La quantité doit être au moins 1")
    private int quantite;
}
