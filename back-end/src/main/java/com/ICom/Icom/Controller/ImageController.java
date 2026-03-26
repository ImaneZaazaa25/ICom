package com.ICom.Icom.Controller;

import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Service.ImageService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/images")
@CrossOrigin
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    // Upload plusieurs images pour un produit
    @PostMapping("/upload/{productId}")
    @PreAuthorize("hasRole('Admin')")
    public List<Image> uploadImages(@PathVariable Long productId,
                                    @RequestParam("files") MultipartFile[] files) throws IOException {

        List<Image> uploadedImages = new ArrayList<>();

        for (MultipartFile file : files) {
            Image image = imageService.ajouterImage(productId, file);
            uploadedImages.add(image);
        }

        return uploadedImages;
    }

    // Images d’un produit
    @GetMapping("/product/{productId}")
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