package com.ICom.Icom.Model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    @JsonIgnore
    @OneToMany(mappedBy = "categorie", cascade = CascadeType.ALL)
    private List<Product> produits;

    public Category() {}

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public List<Product> getProduits() {
        return produits;
    }

    public void setProduits(List<Product> produits) {
        this.produits = produits;
    }
}