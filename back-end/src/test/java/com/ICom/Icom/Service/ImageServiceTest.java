package com.ICom.Icom.Service;

import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Repositories.ImageRepository;
import com.ICom.Icom.Repositories.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ImageServiceTest {

    @Mock
    private ImageRepository imageRepository; // Mock du repository Image

    @Mock
    private ProductRepository productRepository; // Mock du repository Product

    @InjectMocks
    private ImageService imageService; // Service à tester

    private Product product;

    @BeforeEach
    void setUp() {
        // Initialise les mocks Mockito avant chaque test
        MockitoAnnotations.openMocks(this);

        // Création d’un produit simulé utilisé dans les tests
        product = new Product();
        product.setId(1L);
        product.setNom("Laptop");
    }

    @Test
    void testAjouterImage() throws IOException {

        // ARRANGE
        // Simule un fichier image envoyé par le client
        MultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "test image content".getBytes()
        );

        // Simule la recherche du produit en base
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Simule la sauvegarde de l’image
        Image savedImage = new Image();
        savedImage.setId(1L);
        savedImage.setUrl("fake_image.png");
        savedImage.setProduit(product);

        when(imageRepository.save(any(Image.class))).thenReturn(savedImage);

        // ACT
        Image result = imageService.ajouterImage(1L, file);

        // ASSERT

        // Vérifie que l’image est bien créée
        assertNotNull(result);

        // Vérifie que l’ID est correct
        assertEquals(savedImage.getId(), result.getId());

        // Vérifie l’association produit-image
        assertEquals(product, result.getProduit());

        // Vérifie les appels aux repositories
        verify(productRepository, times(1)).findById(1L);
        verify(imageRepository, times(1)).save(any(Image.class));
    }

    @Test
    void testImagesParProduit() {
        // ARRANGE
        Image img = new Image();
        img.setId(1L);
        img.setProduit(product);

        when(imageRepository.findByProduitId(1L)).thenReturn(List.of(img));
        // ACT
        List<Image> result = imageService.imagesParProduit(1L);

        // ASSERT
        // Vérifie qu’une image est retournée
        assertEquals(1, result.size());

        // Vérifie appel repository
        verify(imageRepository).findByProduitId(1L);
    }

    @Test
    void testSupprimerImage() throws IOException {

        // ARRANGE
        Image img = new Image();
        img.setId(1L);
        img.setUrl("image_to_delete.png");

        // Simule la récupération de l’image
        when(imageRepository.findById(1L)).thenReturn(Optional.of(img));

        // ACT
        imageService.supprimerImage(1L);

        // ASSERT

        // Vérifie que la suppression en base est appelée
        verify(imageRepository).deleteById(1L);
    }
}