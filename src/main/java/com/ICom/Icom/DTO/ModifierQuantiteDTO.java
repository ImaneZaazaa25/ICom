package com.ICom.Icom.DTO;

import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ModifierQuantiteDTO {

    @Min(value = 1, message = "La quantité doit être au moins 1")
    private int quantite;
}
