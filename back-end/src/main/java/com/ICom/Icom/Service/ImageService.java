package com.ICom.Icom.Service;

import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Model.Product;
import com.ICom.Icom.Repositories.ImageRepository;
import com.ICom.Icom.Repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class ImageService {

    private final ImageRepository imageRepository;
    private final ProductRepository productRepository;

    // dossier de stockage des images uploadées
    private String uploadDir = "uploads/";

    public ImageService(ImageRepository imageRepository,
                        ProductRepository productRepository) {
        this.imageRepository = imageRepository;
        this.productRepository = productRepository;
    }

    // ajout d'une image à un produit
    public Image ajouterImage(Long productId, MultipartFile file) throws IOException {

        // récupération du produit
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // génération d'un nom unique pour éviter les conflits
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // création du dossier upload si nécessaire
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        // chemin final du fichier
        Path filePath = uploadPath.resolve(fileName);

        // sauvegarde physique du fichier sur le disque
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // sauvegarde en base de données
        Image image = new Image();
        image.setUrl(fileName);
        image.setProduit(product);

        return imageRepository.save(image);
    }

    // récupérer les images d'un produit
    public List<Image> imagesParProduit(Long productId) {
        return imageRepository.findByProduitId(productId);
    }

    // suppression d'une image (fichier + base de données)
    public void supprimerImage(Long id) throws IOException {

        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image non trouvée"));

        Path filePath = Paths.get(uploadDir).resolve(image.getUrl());

        // suppression du fichier s'il existe
        Files.deleteIfExists(filePath);

        // suppression en base
        imageRepository.deleteById(id);
    }
}