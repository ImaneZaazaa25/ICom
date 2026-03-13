package com.ICom.Icom.Controller;

import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Service.ImageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/images")
@CrossOrigin
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    // Upload image pour produit
    @PostMapping("/upload/{productId}")
    @PreAuthorize("hasRole('Admin')")
    public Image uploadImage(@PathVariable Long productId,
                             @RequestParam("file") MultipartFile file) throws IOException {

        return imageService.ajouterImage(productId, file);
    }

    // Images d’un produit
    @GetMapping("/product/{productId}")
    @PreAuthorize("hasRole('Admin')")

    public List<Image> imagesParProduit(@PathVariable Long productId) {
        return imageService.imagesParProduit(productId);
    }

    // Supprimer image
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")

    public void supprimerImage(@PathVariable Long id) throws IOException {
        imageService.supprimerImage(id);
    }
}