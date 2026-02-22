package com.ICom.Icom.Controller;

import com.ICom.Icom.DTO.ProductDTO;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Service.ProductService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/produits")
@CrossOrigin("*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Ajouter un produit
    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public Product ajouterProduit(@RequestBody ProductDTO dto) {
        return productService.ajouterProduit(dto.toProduct(), dto.getCategoryId(), dto.getImages());
    }

    // Modifier un produit
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public Product modifierProduit(@PathVariable Long id, @RequestBody ProductDTO dto) {
        Product produitExistant = productService.trouverProduit(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        produitExistant.setNom(dto.getNom());
        produitExistant.setDescription(dto.getDescription());
        produitExistant.setPrix(dto.getPrix());
        produitExistant.setQuantite(dto.getQuantite());
        produitExistant.setStatut(dto.isStatut());

        return productService.modifierProduit(produitExistant, dto.getCategoryId(), dto.getImages());
    }

    // Supprimer un produit
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public void supprimerProduit(@PathVariable Long id) {
        productService.supprimerProduit(id);
    }

    // Lister tous les produits
    @GetMapping
    @PreAuthorize("hasAnyRole('Admin','User')")
    public List<Product> listerProduits() {
        return productService.listerProduits();
    }

    // Chercher un produit par ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin','User')")
    public Optional<Product> trouverProduit(@PathVariable Long id) {
        return productService.trouverProduit(id);
    }

    // Rechercher produits par catégorie
    @GetMapping("/categorie/{categoryId}")
    @PreAuthorize("hasAnyRole('Admin','User')")
    public List<Product> produitsParCategorie(@PathVariable Long categoryId) {
        return productService.produitsParCategorie(categoryId);
    }

    // Rechercher produits par nom
    @GetMapping("/nom/{keyword}")
    @PreAuthorize("hasAnyRole('Admin','User')")
    public List<Product> produitsParNom(@PathVariable String keyword) {
        return productService.produitsParNom(keyword);
    }

    // Rechercher produits par prix
    @GetMapping("/prix")
    @PreAuthorize("hasAnyRole('Admin','User')")
    public List<Product> produitsParPrix(@RequestParam double min, @RequestParam double max) {
        return productService.produitsParPrix(min, max);
    }

    // Lister produits actifs
    @GetMapping("/actifs")
    @PreAuthorize("hasAnyRole('Admin','User')")
    public List<Product> produitsActifs() {
        return productService.produitsActifs();
    }
}