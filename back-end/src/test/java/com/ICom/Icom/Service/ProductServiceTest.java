package com.ICom.Icom.Service;

import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Repositories.CategoryRepository;
import com.ICom.Icom.Repositories.ImageRepository;
import com.ICom.Icom.Repositories.LigneCommandeRepository;
import com.ICom.Icom.Repositories.ProductRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires du ProductService.
 * Objectif :
 * - Vérifier la gestion des produits (CRUD)
 * - Vérifier l'association avec les catégories et images
 * - Vérifier les règles métier (suppression sécurisée, filtrage, etc.)
 */
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private LigneCommandeRepository ligneCommandeRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private Category category;

    /**
     * Initialisation des objets de test avant chaque scénario.
     */
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Création d'une catégorie fictive
        category = new Category();
        category.setId(1L);

        // Création d'un produit de test
        product = new Product();
        product.setId(1L);
        product.setNom("Laptop");
        product.setPrix(5000);
    }

    /**
     * Test : ajout d'un produit avec images associées
     * - Vérifie sauvegarde produit
     * - Vérifie sauvegarde images
     */
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

    /**
     * Test : récupération de tous les produits
     */
    @Test
    void testListerProduits() {

        List<Product> produits = List.of(product);
        when(productRepository.findAll()).thenReturn(produits);

        List<Product> result = productService.listerProduits();

        assertEquals(1, result.size());
        verify(productRepository).findAll();
    }

    /**
     * Test : recherche d'un produit par ID
     */
    @Test
    void testTrouverProduit() {

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Optional<Product> result = productService.trouverProduit(1L);

        assertTrue(result.isPresent());
        assertEquals("Laptop", result.get().getNom());
    }

    /**
     * Test : suppression d'un produit
     * - Vérifie suppression images
     * - Vérifie suppression produit
     */
    @Test
    void testSupprimerProduit() {

        Long produitId = 1L;

        // On simule qu'aucune commande ne contient ce produit
        when(ligneCommandeRepository.existsByProduitId(produitId)).thenReturn(false);

        productService.supprimerProduit(produitId);

        verify(imageRepository).deleteByProduitId(produitId);
        verify(productRepository).deleteById(produitId);
    }

    /**
     * Test : récupération des produits par catégorie
     */
    @Test
    void testProduitsParCategorie() {

        List<Product> produits = List.of(product);
        when(productRepository.findByCategorieId(1L)).thenReturn(produits);

        List<Product> result = productService.produitsParCategorie(1L);

        assertEquals(1, result.size());
    }

    /**
     * Test : recherche produit par nom (LIKE)
     */
    @Test
    void testProduitsParNom() {

        List<Product> produits = List.of(product);
        when(productRepository.findByNomContaining("Lap")).thenReturn(produits);

        List<Product> result = productService.produitsParNom("Lap");

        assertEquals(1, result.size());
    }
}