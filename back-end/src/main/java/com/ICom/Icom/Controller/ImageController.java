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

    // Injection du service ImageService via le constructeur
    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    // =====================================================
    // UPLOAD DE PLUSIEURS IMAGES POUR UN PRODUIT
    // =====================================================
    // - Accessible uniquement par ADMIN
    // - Permet d’envoyer plusieurs fichiers (MultipartFile[])
    // - Chaque image est associée à un produit via productId
    @PostMapping("/upload/{productId}")
    @PreAuthorize("hasRole('Admin')")
    public List<Image> uploadImages(@PathVariable Long productId,
                                    @RequestParam("files") MultipartFile[] files) throws IOException {

        List<Image> uploadedImages = new ArrayList<>();

        // Parcours de tous les fichiers envoyés
        for (MultipartFile file : files) {
            // Sauvegarde chaque image dans le service
            Image image = imageService.ajouterImage(productId, file);
            uploadedImages.add(image);
        }

        return uploadedImages;
    }

    // =====================================================
    // RÉCUPÉRER LES IMAGES D’UN PRODUIT
    // =====================================================
    // - Retourne toutes les images liées à un produit
    @GetMapping("/product/{productId}")
    public List<Image> imagesParProduit(@PathVariable Long productId) {
        return imageService.imagesParProduit(productId);
    }

    // =====================================================
    // SUPPRIMER UNE IMAGE
    // =====================================================
    // - Accessible uniquement par ADMIN
    // - Supprime l’image de la base et éventuellement du stockage
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public void supprimerImage(@PathVariable Long id) throws IOException {
        imageService.supprimerImage(id);
    }
}