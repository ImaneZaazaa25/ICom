package com.ICom.Icom.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PanierResponseDTO {
    private Long id;
    private List<LignePanierResponseDTO> lignes;
    private double total;
}
