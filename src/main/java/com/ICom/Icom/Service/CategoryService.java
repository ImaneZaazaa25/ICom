package com.ICom.Icom.Service;

import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Repositories.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Ajouter une catégorie
    public Category ajouterCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Lister toutes les catégories
    public List<Category> listerCategories() {
        return categoryRepository.findAll();
    }

    // Chercher une catégorie par ID
    public Optional<Category> trouverCategory(Long id) {
        return categoryRepository.findById(id);
    }

    // Modifier une catégorie
    public Category modifierCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Supprimer une catégorie
    public void supprimerCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    // Chercher une catégorie par nom
    public Optional<Category> categoryParNom(String nom) {
        return categoryRepository.findByNom(nom);
    }

    // Vérifier si une catégorie existe par nom
    public boolean existeCategory(String nom) {
        return categoryRepository.existsByNom(nom);
    }
}