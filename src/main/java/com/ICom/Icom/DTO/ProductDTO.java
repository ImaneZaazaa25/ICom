package com.ICom.Icom.DTO;

import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;

import java.util.List;

public class ProductDTO {

    private String nom;
    private String description;
    private double prix;
    private int quantite;
    private boolean statut;
    private Long categoryId;       // Pour créer ou corriger la catégorie
    private List<Image> images;    // Liste des images du produit

    public ProductDTO() {}

    // Getters et setters
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

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public List<Image> getImages() { return images; }
    public void setImages(List<Image> images) { this.images = images; }

    // Convertir en Product (sans catégorie)
    public Product toProduct() {
        Product produit = new Product();
        produit.setNom(this.nom);
        produit.setDescription(this.description);
        produit.setPrix(this.prix);
        produit.setQuantite(this.quantite);
        produit.setStatut(this.statut);
        return produit;
    }
}