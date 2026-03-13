package com.ICom.Icom.Model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "product")
@Data // Génère getters, setters, toString, equals et hashCode
@NoArgsConstructor // Génère le constructeur sans argument
@AllArgsConstructor // Génère un constructeur avec tous les champs
@Builder // Permet de créer des objets avec le pattern builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String description;
    private double prix;
    private int quantite;
    private boolean statut;

    // Relation ManyToOne avec Category
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category categorie;

    // Relation OneToMany avec Image
    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL)
    private List<Image> images;
}