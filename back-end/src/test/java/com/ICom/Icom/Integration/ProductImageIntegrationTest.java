package com.ICom.Icom.Integration;

import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Repositories.CategoryRepository;
import com.ICom.Icom.Repositories.ImageRepository;
import com.ICom.Icom.Repositories.ProductRepository;
import com.ICom.Icom.Service.ImageService;
import com.ICom.Icom.Service.ProductService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests d'intégration Produit + Image
 *
 * Objectif :
 * - Vérifier la création d’un produit
 * - Vérifier l’ajout d’images liées au produit
 * - Vérifier la suppression produit + images
 * - Tester la cohérence BDD + service + repository
 */
@SpringBootTest
@Transactional // rollback automatique après chaque test
@ActiveProfiles("test")
public class ProductImageIntegrationTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ImageService imageService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ImageRepository imageRepository;

    /**
     * Test : création produit + ajout image
     * Vérifie :
     * - produit bien sauvegardé
     * - relation produit → image correcte
     * - récupération des images par produit
     */
    @Test
    void testAjouterProduitEtImage() throws IOException {

        // =========================
        // 1. Création catégorie
        // =========================
        Category cat = new Category();
        cat.setNom("Électronique");
        Category savedCat = categoryRepository.save(cat);

        // =========================
        // 2. Création produit
        // =========================
        Product p = new Product();
        p.setNom("Laptop");
        p.setPrix(5000);
        p.setQuantite(10);
        p.setStatut(true);

        Product savedProduct = productService.ajouterProduit(p, savedCat.getId(), null);

        // Vérification produit
        assertNotNull(savedProduct.getId());
        assertEquals("Laptop", savedProduct.getNom());
        assertEquals(savedCat.getId(), savedProduct.getCategorie().getId());

        // =========================
        // 3. Création image simulée (fichier upload)
        // =========================
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "contenu image".getBytes()
        );

        // Ajout image via service
        Image savedImage = imageService.ajouterImage(savedProduct.getId(), file);

        // Vérification relation image → produit
        assertNotNull(savedImage.getId());
        assertEquals(savedProduct.getId(), savedImage.getProduit().getId());

        // =========================
        // 4. Vérification récupération images produit
        // =========================
        List<Image> images = imageService.imagesParProduit(savedProduct.getId());
        assertEquals(1, images.size());
    }

    /**
     * Test : suppression produit
     * Vérifie :
     * - suppression produit en base
     * - suppression image associée (cascade logique)
     */
    @Test
    void testSupprimerProduitEtImage() throws IOException {

        // =========================
        // 1. Création produit
        // =========================
        Product p = new Product();
        p.setNom("Phone");
        p.setPrix(3000);
        p.setQuantite(5);
        p.setStatut(true);

        Product savedProduct = productRepository.save(p);

        // =========================
        // 2. Ajout image produit
        // =========================
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "phone.png",
                "image/png",
                "phone content".getBytes()
        );

        Image img = imageService.ajouterImage(savedProduct.getId(), file);

        // =========================
        // 3. Suppression produit
        // =========================
        productService.supprimerProduit(savedProduct.getId());

        // =========================
        // 4. Vérifications après suppression
        // =========================

        // Produit supprimé
        assertFalse(productRepository.findById(savedProduct.getId()).isPresent());

        // Image supprimée
        assertFalse(imageRepository.findById(img.getId()).isPresent());
    }
}