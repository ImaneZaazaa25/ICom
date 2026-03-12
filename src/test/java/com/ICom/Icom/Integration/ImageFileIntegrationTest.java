package com.ICom.Icom.Integration;

import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Repositories.CategoryRepository;
import com.ICom.Icom.Repositories.ImageRepository;
import com.ICom.Icom.Repositories.ProductRepository;
import com.ICom.Icom.Service.ImageService;
import com.ICom.Icom.Service.ProductService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

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
        tempUploadDir = Files.createTempDirectory("uploads_test_");
        // Remplacer le répertoire d'upload dans ImageService via reflection
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
        // Supprimer tous les fichiers créés dans le répertoire temporaire
        Files.walk(tempUploadDir)
                .map(Path::toFile)
                .forEach(file -> file.delete());
    }

    @Test
    void testAjouterEtSupprimerImageAvecFichier() throws IOException {
        // Créer catégorie
        Category cat = new Category();
        cat.setNom("Électronique");
        Category savedCat = categoryRepository.save(cat);

        // Créer produit
        Product p = new Product();
        p.setNom("Laptop");
        p.setPrix(5000);
        p.setQuantite(10);
        p.setStatut(true);
        Product savedProduct = productService.ajouterProduit(p, savedCat.getId(), null);

        // Créer un fichier simulé
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "contenu image".getBytes()
        );

        // Ajouter image
        Image savedImage = imageService.ajouterImage(savedProduct.getId(), file);

        // Vérifier que le fichier physique existe
        Path filePath = tempUploadDir.resolve(savedImage.getUrl());
        assertTrue(Files.exists(filePath), "Le fichier uploadé doit exister");

        // Vérifier que l'image est bien en base
        List<Image> images = imageService.imagesParProduit(savedProduct.getId());
        assertEquals(1, images.size());

        // Supprimer l'image
        imageService.supprimerImage(savedImage.getId());

        // Vérifier suppression du fichier
        assertFalse(Files.exists(filePath), "Le fichier doit être supprimé");

        // Vérifier suppression en base
        assertFalse(imageRepository.findById(savedImage.getId()).isPresent());
    }
}