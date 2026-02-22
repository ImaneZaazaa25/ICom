package com.ICom.Icom.Service;

import com.ICom.Icom.Model.Image;
import com.ICom.Icom.Repositories.ImageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ImageService {

    private final ImageRepository imageRepository;

    public ImageService(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    // Ajouter une image
    public Image ajouterImage(Image image) {
        return imageRepository.save(image);
    }

    // Lister toutes les images
    public List<Image> listerImages() {
        return imageRepository.findAll();
    }

    // 🔎 Chercher une image par ID
    public Optional<Image> trouverImage(Long id) {
        return imageRepository.findById(id);
    }

    // Supprimer une image par ID
    public void supprimerImage(Long id) {
        imageRepository.deleteById(id);
    }

    // Lister toutes les images d’un produit
    public List<Image> imagesParProduit(Long productId) {
        return imageRepository.findByProduitId(productId);
    }

    //Supprimer toutes les images d’un produit
    public void supprimerImagesProduit(Long productId) {
        imageRepository.deleteByProduitId(productId);
    }
}