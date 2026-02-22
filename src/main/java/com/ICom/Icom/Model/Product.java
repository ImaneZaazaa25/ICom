package com.ICom.Icom.Model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "product")
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

    public Product() {}

    // Getters & Setters
    public Long getId() { return id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPrix() { return prix; }
    public void setPrix(double prix) { this.prix = prix; }
    public int getQuantite() { return quantite; }
    public void setQuantite(int quantite) { this.quantite = quantite; }
    public boolean isStatut() { return statut; }
    public void setStatut(boolean statut) { this.statut = statut; }

    public Category getCategorie() { return categorie; }
    public void setCategorie(Category categorie) { this.categorie = categorie; }

    public List<Image> getImages() { return images; }
    public void setImages(List<Image> images) { this.images = images; }
}