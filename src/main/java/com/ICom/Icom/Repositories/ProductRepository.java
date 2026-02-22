package com.ICom.Icom.Repositories;

import com.ICom.Icom.Model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNom(String nom);
    // Rechercher par nom contenant un mot-clé
    List<Product> findByNomContaining(String keyword);
    //  Rechercher par fourchette de prix
    List<Product> findByPrixBetween(double min, double max);
    // Rechercher par statut (true/false)
    List<Product> findByStatut(boolean statut);

    // Rechercher par catégorie
    List<Product> findByCategorieId(Long categoryId);

    // Rechercher produits actifs d’une catégorie
    List<Product> findByCategorieIdAndStatut(Long categoryId, boolean statut);

    // Rechercher produits par nom et statut
    List<Product> findByNomContainingAndStatut(String keyword, boolean statut);

    // Compter les produits dans une catégorie
    long countByCategorieId(Long categoryId);

    // Vérifier si un produit existe par nom
    boolean existsByNom(String nom);

}