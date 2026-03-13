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

    // dossier upload
    private String uploadDir = "uploads/";

    public ImageService(ImageRepository imageRepository,
                        ProductRepository productRepository) {
        this.imageRepository = imageRepository;
        this.productRepository = productRepository;
    }

    // Ajouter image avec fichier
    public Image ajouterImage(Long productId, MultipartFile file) throws IOException {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        // nom unique
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // créer dossier upload
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        // chemin final du fichier
        Path filePath = uploadPath.resolve(fileName);

        // copier fichier
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // sauvegarder en base
        Image image = new Image();
        image.setUrl(fileName);
        image.setProduit(product);

        return imageRepository.save(image);
    }

    // Lister images d'un produit
    public List<Image> imagesParProduit(Long productId) {
        return imageRepository.findByProduitId(productId);
    }

    // Supprimer image (base + fichier)
    public void supprimerImage(Long id) throws IOException {

        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image non trouvée"));

        Path filePath = Paths.get(uploadDir).resolve(image.getUrl());

        // supprimer fichier s'il existe
        Files.deleteIfExists(filePath);

        // supprimer en base
        imageRepository.deleteById(id);
    }
}