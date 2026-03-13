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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ImageServiceTest {

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ImageService imageService;

    private Product product;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        product = new Product();
        product.setId(1L);
        product.setNom("Laptop");
    }

    @Test
    void testAjouterImage() throws IOException {

        MultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "test image content".getBytes()
        );

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Image savedImage = new Image();
        savedImage.setId(1L);
        savedImage.setUrl("fake_image.png");
        savedImage.setProduit(product);

        when(imageRepository.save(any(Image.class))).thenReturn(savedImage);

        Image result = imageService.ajouterImage(1L, file);

        assertNotNull(result);
        assertEquals(savedImage.getId(), result.getId());
        assertEquals(product, result.getProduit());

        verify(productRepository, times(1)).findById(1L);
        verify(imageRepository, times(1)).save(any(Image.class));
    }

    @Test
    void testImagesParProduit() {

        Image img = new Image();
        img.setId(1L);
        img.setProduit(product);

        when(imageRepository.findByProduitId(1L)).thenReturn(List.of(img));

        List<Image> result = imageService.imagesParProduit(1L);

        assertEquals(1, result.size());
        verify(imageRepository).findByProduitId(1L);
    }

    @Test
    void testSupprimerImage() throws IOException {

        Image img = new Image();
        img.setId(1L);
        img.setUrl("image_to_delete.png");

        when(imageRepository.findById(1L)).thenReturn(Optional.of(img));

        // Appel de la méthode
        imageService.supprimerImage(1L);

        verify(imageRepository).deleteById(1L);
    }
}