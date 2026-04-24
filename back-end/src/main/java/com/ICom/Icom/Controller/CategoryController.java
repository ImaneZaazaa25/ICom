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
@CrossOrigin("*")
public class CategoryController {

    private final CategoryService categoryService;

    // Injection du service Category via le constructeur
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // =========================
    // AJOUTER UNE CATÉGORIE
    // =========================
    @PostMapping
    @PreAuthorize("hasRole('Admin')") // accès réservé à l'admin
    public ResponseEntity<Category> ajouterCategory(@RequestBody Category category) {
        Category savedCategory = categoryService.ajouterCategory(category);
        return new ResponseEntity<>(savedCategory, HttpStatus.CREATED);
    }

    // =========================
    // LISTER TOUTES LES CATÉGORIES
    // =========================
    @GetMapping
    public ResponseEntity<List<Category>> listerCategories() {
        List<Category> categories = categoryService.listerCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // =========================
    // TROUVER UNE CATÉGORIE PAR ID
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<Category> trouverCategory(@PathVariable Long id) {
        Optional<Category> category = categoryService.trouverCategory(id);

        // si trouvé -> 200 OK, sinon -> 404 NOT FOUND
        return category.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // =========================
    // MODIFIER UNE CATÉGORIE
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<Category> modifierCategory(@PathVariable Long id, @RequestBody Category category) {
        Optional<Category> existingCategory = categoryService.trouverCategory(id);

        if (existingCategory.isPresent()) {
            // on force l'ID pour éviter les modifications incorrectes
            category.setId(id);
            Category updatedCategory = categoryService.modifierCategory(category);
            return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // =========================
    // SUPPRIMER UNE CATÉGORIE
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerCategory(@PathVariable Long id) {
        if (categoryService.trouverCategory(id).isPresent()) {
            categoryService.supprimerCategory(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // =========================
    // RECHERCHER PAR NOM
    // =========================
    @GetMapping("/search")
    public ResponseEntity<Category> categoryParNom(@RequestParam String nom) {
        Optional<Category> category = categoryService.categoryParNom(nom);

        return category.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // =========================
    // VÉRIFIER SI UNE CATÉGORIE EXISTE
    // =========================
    @GetMapping("/exists")
    @PreAuthorize("hasAnyRole('Admin')") // seulement admin
    public ResponseEntity<Boolean> existeCategory(@RequestParam String nom) {
        boolean exists = categoryService.existeCategory(nom);
        return new ResponseEntity<>(exists, HttpStatus.OK);
    }
}