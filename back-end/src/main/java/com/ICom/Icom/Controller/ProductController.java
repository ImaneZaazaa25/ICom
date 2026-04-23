package com.ICom.Icom.Controller;

import com.ICom.Icom.DTO.ProductDTO;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Service.ProductService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/produits")
@CrossOrigin("*")
public class ProductController {

    private final ProductService productService;

    // Injection du service ProductService via le constructeur
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // =====================================================
    // AJOUTER UN PRODUIT
    // =====================================================
    // - Accessible uniquement par ADMIN
    // - Convertit le DTO en entité Product
    // - Associe catégorie + images
    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public Product ajouterProduit(@RequestBody ProductDTO dto) {
        return productService.ajouterProduit(
                dto.toProduct(),
                dto.getCategoryId(),
                dto.getImages()
        );
    }

    // =====================================================
    // MODIFIER UN PRODUIT
    // =====================================================
    // - ADMIN uniquement
    // - Récupère le produit existant
    // - Met à jour ses champs
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public Product modifierProduit(@PathVariable Long id, @RequestBody ProductDTO dto) {

        Product produitExistant = productService.trouverProduit(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // Mise à jour des champs
        produitExistant.setNom(dto.getNom());
        produitExistant.setDescription(dto.getDescription());
        produitExistant.setPrix(dto.getPrix());
        produitExistant.setQuantite(dto.getQuantite());
        produitExistant.setStatut(dto.isStatut());

        return productService.modifierProduit(
                produitExistant,
                dto.getCategoryId(),
                dto.getImages()
        );
    }

    // =====================================================
    // SUPPRIMER UN PRODUIT
    // =====================================================
    // - ADMIN uniquement
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public void supprimerProduit(@PathVariable Long id) {
        productService.supprimerProduit(id);
    }

    // =====================================================
    // LISTER TOUS LES PRODUITS
    // =====================================================
    // - Accessible à tous (public)
    @GetMapping
    public List<Product> listerProduits() {
        return productService.listerProduits();
    }

    // =====================================================
    // TROUVER UN PRODUIT PAR ID
    // =====================================================
    // - Public
    @GetMapping("/{id}")
    public Optional<Product> trouverProduit(@PathVariable Long id) {
        return productService.trouverProduit(id);
    }

    // =====================================================
    // PRODUITS PAR CATÉGORIE
    // =====================================================
    @GetMapping("/categorie/{categoryId}")
    public List<Product> produitsParCategorie(@PathVariable Long categoryId) {
        return productService.produitsParCategorie(categoryId);
    }

    // =====================================================
    // RECHERCHE PAR NOM
    // =====================================================
    @GetMapping("/nom/{keyword}")
    public List<Product> produitsParNom(@PathVariable String keyword) {
        return productService.produitsParNom(keyword);
    }

    // =====================================================
    // RECHERCHE PAR INTERVALLE DE PRIX
    // =====================================================
    @GetMapping("/prix")
    public List<Product> produitsParPrix(@RequestParam double min,
                                         @RequestParam double max) {
        return productService.produitsParPrix(min, max);
    }

    // =====================================================
    // PRODUITS ACTIFS UNIQUEMENT
    // =====================================================
    @GetMapping("/actifs")
    public List<Product> produitsActifs() {
        return productService.produitsActifs();
    }
}