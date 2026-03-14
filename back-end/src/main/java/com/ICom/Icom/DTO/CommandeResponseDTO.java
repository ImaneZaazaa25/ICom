package com.ICom.Icom.DTO;

import com.ICom.Icom.Model.EtatCommande;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommandeResponseDTO {
    private Long id;
    private Date dateCommande;
    private EtatCommande etat;
    private List<LigneCommandeResponseDTO> lignes;
    private double total;
}
