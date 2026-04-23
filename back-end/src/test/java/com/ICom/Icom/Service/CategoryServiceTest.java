package com.ICom.Icom.Service;

import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Repositories.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires du service CategoryService.
 *
 * Objectif :
 * - Vérifier la logique métier du service
 * - Sans dépendre de la base de données
 * - Grâce à Mockito (mock du repository)
 */
@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    // Mock du repository (on simule la base de données)
    @Mock
    private CategoryRepository categoryRepository;

    // Injection du mock dans le service à tester
    @InjectMocks
    private CategoryService categoryService;

    // Objet utilisé dans plusieurs tests
    private Category category;

    /**
     * Initialisation exécutée avant chaque test.
     * Permet d’avoir un objet Category propre à chaque test.
     */
    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setNom("Informatique");
    }

    // =============================
    // TEST : AJOUT CATÉGORIE
    // =============================
    @Test
    void testAjouterCategory() {

        // Simulation : le repository retourne la catégorie sauvegardée
        when(categoryRepository.save(category)).thenReturn(category);

        // Appel du service
        Category result = categoryService.ajouterCategory(category);

        // Vérifications
        assertNotNull(result);
        assertEquals("Informatique", result.getNom());

        // Vérifie que save() a été appelé une seule fois
        verify(categoryRepository, times(1)).save(category);
    }

    // =============================
    // TEST : LISTE DES CATÉGORIES
    // =============================
    @Test
    void testListerCategories() {

        // Simulation : une liste contenant une catégorie
        when(categoryRepository.findAll())
                .thenReturn(Arrays.asList(category));

        // Appel service
        List<Category> result = categoryService.listerCategories();

        // Vérification
        assertEquals(1, result.size());

        // Vérifie appel repository
        verify(categoryRepository, times(1)).findAll();
    }

    // =============================
    // TEST : RECHERCHE PAR ID
    // =============================
    @Test
    void testTrouverCategory() {

        // Simulation : catégorie trouvée en base
        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(category));

        // Appel service
        Optional<Category> result = categoryService.trouverCategory(1L);

        // Vérifications
        assertTrue(result.isPresent());
        assertEquals("Informatique", result.get().getNom());
    }

    // =============================
    // TEST : SUPPRESSION
    // =============================
    @Test
    void testSupprimerCategory() {

        // Simulation suppression (aucun retour)
        doNothing().when(categoryRepository).deleteById(1L);

        // Appel service
        categoryService.supprimerCategory(1L);

        // Vérifie que deleteById a été appelé
        verify(categoryRepository, times(1)).deleteById(1L);
    }

    // =============================
    // TEST : EXISTENCE PAR NOM
    // =============================
    @Test
    void testExisteCategory() {

        // Simulation : catégorie existe déjà
        when(categoryRepository.existsByNom("Informatique"))
                .thenReturn(true);

        // Appel service
        boolean result = categoryService.existeCategory("Informatique");

        // Vérification
        assertTrue(result);
    }
}