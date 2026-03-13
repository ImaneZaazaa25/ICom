package com.ICom.Icom.Repositories;

import com.ICom.Icom.Model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // ✅ Chercher une catégorie par nom
    Optional<Category> findByNom(String nom);

    // ✅ Vérifier si une catégorie existe par nom
    boolean existsByNom(String nom);


}