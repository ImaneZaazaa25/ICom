package com.ICom.Icom.Service;

import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Repositories.CategoryRepository;
import com.ICom.Icom.Repositories.ImageRepository;
import com.ICom.Icom.Repositories.ProductRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ImageRepository imageRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private Category category;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        category = new Category();
        category.setId(1L);

        product = new Product();
        product.setId(1L);
        product.setNom("Laptop");
        product.setPrix(5000);
    }

    @Test
    void testAjouterProduit() {

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(product)).thenReturn(product);

        List<Image> images = new ArrayList<>();
        Image img = new Image();
        images.add(img);

        Product result = productService.ajouterProduit(product, 1L, images);

        assertNotNull(result);
        verify(productRepository, times(1)).save(product);
        verify(imageRepository, times(1)).save(img);
    }

    @Test
    void testListerProduits() {

        List<Product> produits = List.of(product);
        when(productRepository.findAll()).thenReturn(produits);

        List<Product> result = productService.listerProduits();

        assertEquals(1, result.size());
        verify(productRepository).findAll();
    }

    @Test
    void testTrouverProduit() {

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Optional<Product> result = productService.trouverProduit(1L);

        assertTrue(result.isPresent());
        assertEquals("Laptop", result.get().getNom());
    }

    @Test
    void testSupprimerProduit() {

        productService.supprimerProduit(1L);

        verify(imageRepository).deleteByProduitId(1L);
        verify(productRepository).deleteById(1L);
    }

    @Test
    void testProduitsParCategorie() {

        List<Product> produits = List.of(product);
        when(productRepository.findByCategorieId(1L)).thenReturn(produits);

        List<Product> result = productService.produitsParCategorie(1L);

        assertEquals(1, result.size());
    }

    @Test
    void testProduitsParNom() {

        List<Product> produits = List.of(product);
        when(productRepository.findByNomContaining("Lap")).thenReturn(produits);

        List<Product> result = productService.produitsParNom("Lap");

        assertEquals(1, result.size());
    }
}