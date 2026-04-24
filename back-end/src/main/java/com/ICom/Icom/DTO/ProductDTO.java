package com.ICom.Icom.DTO;

import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;

import java.util.List;

public class ProductDTO {

    // nom du produit
    private String nom;

    // description du produit
    private String description;

    // prix du produit
    private double prix;

    // quantité en stock
    private int quantite;

    // statut du produit (actif / inactif)
    private boolean statut;

    // id de la catégorie associée au produit
    private Long categoryId;

    // liste des images du produit
    private List<Image> images;

    public ProductDTO() {}

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

    // conversion du DTO vers l'entité Product
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