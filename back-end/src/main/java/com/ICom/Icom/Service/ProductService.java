package com.ICom.Icom.Service;

import org.springframework.transaction.annotation.Transactional;
import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Repositories.CategoryRepository;
import com.ICom.Icom.Repositories.ImageRepository;
import com.ICom.Icom.Repositories.ProductRepository;
import com.ICom.Icom.Repositories.LigneCommandeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ImageRepository imageRepository;
    private final LigneCommandeRepository ligneCommandeRepository;

    // injection des repositories
    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ImageRepository imageRepository,
                          LigneCommandeRepository ligneCommandeRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.imageRepository = imageRepository;
        this.ligneCommandeRepository = ligneCommandeRepository;
    }

    // ajouter un produit avec catégorie et images
    public Product ajouterProduit(Product produit, Long categoryId, List<Image> images) {

        // association catégorie si fournie
        if (categoryId != null) {
            Category cat = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
            produit.setCategorie(cat);
        }

        // sauvegarde produit
        Product saved = productRepository.save(produit);

        // sauvegarde des images associées
        if (images != null) {
            for (Image img : images) {
                img.setProduit(saved);
                imageRepository.save(img);
            }
        }

        return saved;
    }

    // modifier un produit
    @Transactional
    public Product modifierProduit(Product produit, Long newCategoryId, List<Image> newImages) {

        // mise à jour catégorie
        if (newCategoryId != null) {
            Category cat = categoryRepository.findById(newCategoryId)
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
            produit.setCategorie(cat);
        }

        Product updated = productRepository.save(produit);

        // remplacement des images si nouvelles images fournies
        if (newImages != null) {
            imageRepository.deleteByProduitId(updated.getId());

            for (Image img : newImages) {
                img.setProduit(updated);
                imageRepository.save(img);
            }
        }

        return updated;
    }

    // suppression logique ou physique du produit
    @Transactional
    public void supprimerProduit(Long id) {

        // vérifie si le produit est utilisé dans des commandes
        boolean existeDansCommande = ligneCommandeRepository.existsByProduitId(id);

        if (existeDansCommande) {

            // suppression logique (désactivation)
            Product produit = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Produit introuvable"));

            produit.setStatut(false);
            productRepository.save(produit);

        } else {

            // suppression physique
            imageRepository.deleteByProduitId(id);
            productRepository.deleteById(id);
        }
    }

    // récupérer tous les produits
    public List<Product> listerProduits() {
        return productRepository.findAll();
    }

    // trouver un produit par id
    public Optional<Product> trouverProduit(Long id) {
        return productRepository.findById(id);
    }

    // produits par catégorie
    public List<Product> produitsParCategorie(Long categoryId) {
        return productRepository.findByCategorieId(categoryId);
    }

    // recherche par nom (like)
    public List<Product> produitsParNom(String keyword) {
        return productRepository.findByNomContaining(keyword);
    }

    // recherche par intervalle de prix
    public List<Product> produitsParPrix(double min, double max) {
        return productRepository.findByPrixBetween(min, max);
    }

    // produits actifs uniquement
    public List<Product> produitsActifs() {
        return productRepository.findByStatut(true);
    }
}