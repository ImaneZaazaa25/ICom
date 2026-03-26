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

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ImageRepository imageRepository,
                          LigneCommandeRepository ligneCommandeRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.imageRepository = imageRepository;
        this.ligneCommandeRepository = ligneCommandeRepository;
    }

    // Ajouter un produit
    public Product ajouterProduit(Product produit, Long categoryId, List<Image> images) {
        if (categoryId != null) {
            Category cat = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
            produit.setCategorie(cat);
        }
        Product saved = productRepository.save(produit);

        // Sauvegarder les images
        if (images != null) {
            for (Image img : images) {
                img.setProduit(saved);
                imageRepository.save(img);
            }
        }
        return saved;
    }

    // Modifier un produit
    @Transactional

    public Product modifierProduit(Product produit, Long newCategoryId, List<Image> newImages) {
        if (newCategoryId != null) {
            Category cat = categoryRepository.findById(newCategoryId)
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
            produit.setCategorie(cat);
        }

        Product updated = productRepository.save(produit);

        // Supprimer anciennes images si nouvelles sont fournies
        if (newImages != null) {
            imageRepository.deleteByProduitId(updated.getId());
            for (Image img : newImages) {
                img.setProduit(updated);
                imageRepository.save(img);
            }
        }
        return updated;
    }

    // Supprimer un produit
    @Transactional
    public void supprimerProduit(Long id) {

        boolean existeDansCommande = ligneCommandeRepository.existsByProduitId(id);

        if (existeDansCommande) {
            // ne pas supprimer → désactiver
            Product produit = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Produit introuvable"));

            produit.setStatut(false);
            productRepository.save(produit);

        } else {
            // suppression réelle
            imageRepository.deleteByProduitId(id);
            productRepository.deleteById(id);
        }
    }

    // Lister tous les produits
    public List<Product> listerProduits() {
        return productRepository.findAll();
    }

    // Chercher un produit par ID
    public Optional<Product> trouverProduit(Long id) {
        return productRepository.findById(id);
    }

    // Rechercher produits par catégorie
    public List<Product> produitsParCategorie(Long categoryId) {
        return productRepository.findByCategorieId(categoryId);
    }

    // Rechercher produits par nom (contient)
    public List<Product> produitsParNom(String keyword) {
        return productRepository.findByNomContaining(keyword);
    }

    // Rechercher produits par prix
    public List<Product> produitsParPrix(double min, double max) {
        return productRepository.findByPrixBetween(min, max);
    }

    // Lister produits actifs
    public List<Product> produitsActifs() {
        return productRepository.findByStatut(true);
    }
}