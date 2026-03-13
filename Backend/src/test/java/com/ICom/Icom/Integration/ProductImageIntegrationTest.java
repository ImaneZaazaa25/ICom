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

@SpringBootTest
@Transactional//   Permet de rollback après chaque test
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

    @Test
    void testAjouterProduitEtImage() throws IOException {
        // Création d'une catégorie
        Category cat = new Category();
        cat.setNom("Électronique");
        Category savedCat = categoryRepository.save(cat);

        // Création du produit
        Product p = new Product();
        p.setNom("Laptop");
        p.setPrix(5000);
        p.setQuantite(10);
        p.setStatut(true);

        Product savedProduct = productService.ajouterProduit(p, savedCat.getId(), null);

        assertNotNull(savedProduct.getId());
        assertEquals("Laptop", savedProduct.getNom());
        assertEquals(savedCat.getId(), savedProduct.getCategorie().getId());

        // Création d'une image pour le produit
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "contenu image".getBytes()
        );

        Image savedImage = imageService.ajouterImage(savedProduct.getId(), file);

        assertNotNull(savedImage.getId());
        assertEquals(savedProduct.getId(), savedImage.getProduit().getId());

        // Vérifier la liste des images par produit
        List<Image> images = imageService.imagesParProduit(savedProduct.getId());
        assertEquals(1, images.size());
    }

    @Test
    void testSupprimerProduitEtImage() throws IOException {
        // Création produit + image
        Product p = new Product();
        p.setNom("Phone");
        p.setPrix(3000);
        p.setQuantite(5);
        p.setStatut(true);

        Product savedProduct = productRepository.save(p);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "phone.png",
                "image/png",
                "phone content".getBytes()
        );

        Image img = imageService.ajouterImage(savedProduct.getId(), file);

        // Supprimer le produit (doit supprimer aussi l'image en cascade)
        productService.supprimerProduit(savedProduct.getId());

        assertFalse(productRepository.findById(savedProduct.getId()).isPresent());
        assertFalse(imageRepository.findById(img.getId()).isPresent());
    }
}