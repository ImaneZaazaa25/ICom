package com.ICom.Icom.Controller;

import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Ajouter une catégorie
    @PostMapping
    public ResponseEntity<Category> ajouterCategory(@RequestBody Category category) {
        Category savedCategory = categoryService.ajouterCategory(category);
        return new ResponseEntity<>(savedCategory, HttpStatus.CREATED);
    }

    // Lister toutes les catégories
    @GetMapping
    public ResponseEntity<List<Category>> listerCategories() {
        List<Category> categories = categoryService.listerCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // Chercher une catégorie par ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> trouverCategory(@PathVariable Long id) {
        Optional<Category> category = categoryService.trouverCategory(id);
        return category.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Modifier une catégorie
    @PutMapping("/{id}")
    public ResponseEntity<Category> modifierCategory(@PathVariable Long id, @RequestBody Category category) {
        Optional<Category> existingCategory = categoryService.trouverCategory(id);
        if (existingCategory.isPresent()) {
            category.setId(id); // Assure que l'ID reste le même
            Category updatedCategory = categoryService.modifierCategory(category);
            return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Supprimer une catégorie
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerCategory(@PathVariable Long id) {
        if (categoryService.trouverCategory(id).isPresent()) {
            categoryService.supprimerCategory(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Chercher une catégorie par nom
    @GetMapping("/search")
    public ResponseEntity<Category> categoryParNom(@RequestParam String nom) {
        Optional<Category> category = categoryService.categoryParNom(nom);
        return category.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Vérifier si une catégorie existe par nom
    @GetMapping("/exists")
    @PreAuthorize("hasAnyRole('ADMIN')")

    public ResponseEntity<Boolean> existeCategory(@RequestParam String nom) {
        boolean exists = categoryService.existeCategory(nom);
        return new ResponseEntity<>(exists, HttpStatus.OK);
    }
}