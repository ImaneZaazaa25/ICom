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

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setNom("Informatique");
    }

    // =============================
    // TEST AJOUT
    // =============================
    @Test
    void testAjouterCategory() {

        when(categoryRepository.save(category)).thenReturn(category);

        Category result = categoryService.ajouterCategory(category);

        assertNotNull(result);
        assertEquals("Informatique", result.getNom());
        verify(categoryRepository, times(1)).save(category);
    }

    // =============================
    // TEST LISTE
    // =============================
    @Test
    void testListerCategories() {

        when(categoryRepository.findAll())
                .thenReturn(Arrays.asList(category));

        List<Category> result = categoryService.listerCategories();

        assertEquals(1, result.size());
        verify(categoryRepository, times(1)).findAll();
    }

    // =============================
    // TEST FIND BY ID
    // =============================
    @Test
    void testTrouverCategory() {

        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(category));

        Optional<Category> result = categoryService.trouverCategory(1L);

        assertTrue(result.isPresent());
        assertEquals("Informatique", result.get().getNom());
    }

    // =============================
    // TEST DELETE
    // =============================
    @Test
    void testSupprimerCategory() {

        doNothing().when(categoryRepository).deleteById(1L);

        categoryService.supprimerCategory(1L);

        verify(categoryRepository, times(1)).deleteById(1L);
    }

    // =============================
    // TEST EXIST BY NOM
    // =============================
    @Test
    void testExisteCategory() {

        when(categoryRepository.existsByNom("Informatique"))
                .thenReturn(true);

        boolean result = categoryService.existeCategory("Informatique");

        assertTrue(result);
    }
}