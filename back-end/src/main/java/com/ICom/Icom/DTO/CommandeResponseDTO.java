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

    // id de la commande
    private Long id;

    // date de création de la commande
    private Date dateCommande;

    // état de la commande (EN_ATTENTE, VALIDÉE, etc.)
    private EtatCommande etat;

    // liste des produits dans la commande
    private List<LigneCommandeResponseDTO> lignes;

    // prix total de la commande
    private double total;
}