package com.ICom.Icom.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "image")
@Data // Génère getters, setters, toString, equals, hashCode
@NoArgsConstructor // Génère un constructeur sans argument
@AllArgsConstructor // Génère un constructeur avec tous les champs
@Builder // Permet d'utiliser le pattern builder
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "product_id")
    private Product produit;
}