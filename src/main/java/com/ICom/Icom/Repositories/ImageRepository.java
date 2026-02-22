package com.ICom.Icom.Repositories;

import com.ICom.Icom.Model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    // Récupérer toutes les images d’un produit
    List<Image> findByProduitId(Long productId);

    // Supprimer toutes les images d’un produit
    void deleteByProduitId(Long productId);
}