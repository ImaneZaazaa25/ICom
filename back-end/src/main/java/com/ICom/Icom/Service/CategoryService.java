package com.ICom.Icom.Service;

import com.ICom.Icom.Model.Category;
import com.ICom.Icom.Repositories.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // injection du repository Category
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // ajouter une catégorie
    public Category ajouterCategory(Category category) {
        return categoryRepository.save(category);
    }

    // récupérer toutes les catégories
    public List<Category> listerCategories() {
        return categoryRepository.findAll();
    }

    // rechercher une catégorie par id
    public Optional<Category> trouverCategory(Long id) {
        return categoryRepository.findById(id);
    }

    // modifier une catégorie (save = update si id existe)
    public Category modifierCategory(Category category) {
        return categoryRepository.save(category);
    }

    // supprimer une catégorie par id
    public void supprimerCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    // rechercher une catégorie par nom
    public Optional<Category> categoryParNom(String nom) {
        return categoryRepository.findByNom(nom);
    }

    // vérifier si une catégorie existe par nom
    public boolean existeCategory(String nom) {
        return categoryRepository.existsByNom(nom);
    }
}