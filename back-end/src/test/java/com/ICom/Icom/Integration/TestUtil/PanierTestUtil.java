package com.ICom.Icom.Integration.TestUtil;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Classe utilitaire pour les opérations du PanierController dans les tests d'intégration.
 * Gère uniquement les interactions avec le catalogue (produits/catégories) et le panier.
 *
 * Pour l'authentification, utiliser {@link UserTestUtil}.
 */
public class PanierTestUtil {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PanierTestUtil(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    // ==========================================================================
    // Création de données de catalogue (token Admin requis)
    // ==========================================================================

    /**
     * Crée une catégorie et retourne son ID.
     */
    public Long creerCategorie(String adminToken, String nom) throws Exception {
        String response = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nom": "%s"}
                                """.formatted(nom)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    /**
     * Crée un produit et retourne son ID.
     *
     * @param statut true = produit actif, false = produit inactif
     */
    public Long creerProduit(String adminToken, String nom, double prix, int quantite,
                             boolean statut, Long categoryId) throws Exception {
        String response = mockMvc.perform(post("/api/produits")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "nom": "%s",
                                    "description": "Produit de test",
                                    "prix": %s,
                                    "quantite": %d,
                                    "statut": %b,
                                    "categoryId": %d,
                                    "images": []
                                }
                                """.formatted(nom, prix, quantite, statut, categoryId)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    /**
     * Désactive un produit (statut = false) via l'API Admin.
     * Utile pour tester le refus de validation d'un panier contenant un produit inactif.
     */
    public void desactiverProduit(String adminToken, Long produitId) throws Exception {
        mockMvc.perform(put("/api/produits/{id}", produitId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "nom": "Produit desactive",
                                    "description": "Produit de test",
                                    "prix": 1.0,
                                    "quantite": 10,
                                    "statut": false,
                                    "images": []
                                }
                                """))
                .andExpect(status().isOk());
    }

    // ==========================================================================
    // Opérations Panier — retournent ResultActions pour chaîner les assertions
    // ==========================================================================

    /** GET /api/panier */
    public ResultActions getPanier(String token) throws Exception {
        return mockMvc.perform(get("/api/panier")
                .header("Authorization", "Bearer " + token));
    }

    /** POST /api/panier/items */
    public ResultActions ajouterProduit(String token, Long produitId, int quantite) throws Exception {
        return mockMvc.perform(post("/api/panier/items")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"produitId": %d, "quantite": %d}
                        """.formatted(produitId, quantite)));
    }

    /** PUT /api/panier/items/{ligneId} */
    public ResultActions modifierQuantite(String token, Long ligneId, int quantite) throws Exception {
        return mockMvc.perform(put("/api/panier/items/{ligneId}", ligneId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"quantite": %d}
                        """.formatted(quantite)));
    }

    /** DELETE /api/panier/items/{ligneId} */
    public ResultActions supprimerLigne(String token, Long ligneId) throws Exception {
        return mockMvc.perform(delete("/api/panier/items/{ligneId}", ligneId)
                .header("Authorization", "Bearer " + token));
    }

    // ==========================================================================
    // Helpers d'extraction — parsent la réponse GET /api/panier
    // ==========================================================================

    /**
     * Retourne l'ID de la LignePanier correspondant au produit donné.
     * Lance une RuntimeException si aucune ligne ne correspond.
     */
    public Long getLigneIdPourProduit(String token, Long produitId) throws Exception {
        String response = getPanier(token).andReturn().getResponse().getContentAsString();
        JsonNode lignes = objectMapper.readTree(response).get("lignes");
        for (JsonNode ligne : lignes) {
            if (ligne.get("produitId").asLong() == produitId) {
                return ligne.get("id").asLong();
            }
        }
        throw new RuntimeException("Aucune ligne trouvée pour produitId=" + produitId);
    }

    /**
     * Retourne la quantité actuelle d'un produit dans le panier.
     */
    public int getQuantitePourProduit(String token, Long produitId) throws Exception {
        String response = getPanier(token).andReturn().getResponse().getContentAsString();
        JsonNode lignes = objectMapper.readTree(response).get("lignes");
        for (JsonNode ligne : lignes) {
            if (ligne.get("produitId").asLong() == produitId) {
                return ligne.get("quantite").asInt();
            }
        }
        throw new RuntimeException("Aucune ligne trouvée pour produitId=" + produitId);
    }

    /**
     * Retourne le nombre de lignes actuellement dans le panier.
     */
    public int getNombreLignes(String token) throws Exception {
        String response = getPanier(token).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("lignes").size();
    }
}
