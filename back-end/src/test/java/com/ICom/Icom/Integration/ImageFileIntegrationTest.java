package com.ICom.Icom.Integration;

import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Repositories.CategoryRepository;
import com.ICom.Icom.Repositories.ImageRepository;
import com.ICom.Icom.Service.ImageService;
import com.ICom.Icom.Service.ProductService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import com.ICom.Icom.Repositories.ProductRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ImageFileIntegrationTest {

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

    private Path tempUploadDir;

    @BeforeAll
    void setupTempDir() throws IOException {

        // création dossier temporaire
        tempUploadDir = Files.createTempDirectory("uploads_test_");

        // injection du path dans ImageService (reflection)
        try {
            java.lang.reflect.Field field = ImageService.class.getDeclaredField("uploadDir");
            field.setAccessible(true);
            field.set(imageService, tempUploadDir.toString() + "/");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @AfterAll
    void cleanupTempDir() throws IOException {

        // suppression du dossier temporaire après tests
        Files.walk(tempUploadDir)
                .map(Path::toFile)
                .forEach(file -> file.delete());
    }

    @Test
    void testAjouterEtSupprimerImageAvecFichier() throws IOException {

        // création catégorie
        Category cat = new Category();
        cat.setNom("Électronique");
        Category savedCat = categoryRepository.save(cat);

        // création produit
        Product p = new Product();
        p.setNom("Laptop");
        p.setPrix(5000);
        p.setQuantite(10);
        p.setStatut(true);

        Product savedProduct = productService.ajouterProduit(p, savedCat.getId(), null);

        // simulation upload fichier
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "contenu image".getBytes()
        );

        // ajout image
        Image savedImage = imageService.ajouterImage(savedProduct.getId(), file);

        // vérifie fichier créé
        Path filePath = tempUploadDir.resolve(savedImage.getUrl());
        assertTrue(Files.exists(filePath));

        // vérifie base
        List<Image> images = imageService.imagesParProduit(savedProduct.getId());
        assertEquals(1, images.size());

        // suppression image
        imageService.supprimerImage(savedImage.getId());

        // vérifie suppression fichier
        assertFalse(Files.exists(filePath));

        // vérifie suppression base
        assertFalse(imageRepository.findById(savedImage.getId()).isPresent());
    }
}