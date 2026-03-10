package com.ICom.Icom.Integration.TestUtil;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

/**
 * Classe utilitaire pour les opérations du CommandeController dans les tests d'intégration.
 * Gère uniquement les interactions avec /api/commandes.
 *
 * Pour l'authentification, utiliser {@link UserTestUtil}.
 * Pour préparer le panier avant validation, utiliser {@link PanierTestUtil}.
 */
public class CommandeTestUtil {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CommandeTestUtil(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    // ==========================================================================
    // Opérations Commande — retournent ResultActions pour chaîner les assertions
    // ==========================================================================

    /**
     * POST /api/commandes — valide le panier courant du client et crée une commande.
     */
    public ResultActions validerPanier(String token) throws Exception {
        return mockMvc.perform(post("/api/commandes")
                .header("Authorization", "Bearer " + token));
    }

    /**
     * GET /api/commandes — retourne l'historique des commandes du client.
     */
    public ResultActions getMesCommandes(String token) throws Exception {
        return mockMvc.perform(get("/api/commandes")
                .header("Authorization", "Bearer " + token));
    }

    // ==========================================================================
    // Helpers d'extraction — parsent la réponse GET /api/commandes
    // ==========================================================================

    /**
     * Retourne le nombre de commandes dans l'historique du client.
     */
    public int getNombreCommandes(String token) throws Exception {
        String response = getMesCommandes(token).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).size();
    }

    /**
     * Retourne l'ID de la commande à l'index donné (0 = la plus récente si triée).
     */
    public Long getCommandeId(String token, int index) throws Exception {
        String response = getMesCommandes(token).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get(index).get("id").asLong();
    }

    /**
     * Retourne l'état (String) de la commande à l'index donné.
     * Valeurs possibles : "EN_COURS", "VALIDEE", "ANNULEE".
     */
    public String getEtatCommande(String token, int index) throws Exception {
        String response = getMesCommandes(token).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get(index).get("etat").asText();
    }

    /**
     * Retourne le total de la commande à l'index donné.
     */
    public double getTotalCommande(String token, int index) throws Exception {
        String response = getMesCommandes(token).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get(index).get("total").asDouble();
    }

    /**
     * Retourne le nombre de lignes de la commande à l'index donné.
     */
    public int getNombreLignesCommande(String token, int index) throws Exception {
        String response = getMesCommandes(token).andReturn().getResponse().getContentAsString();
        JsonNode lignes = objectMapper.readTree(response).get(index).get("lignes");
        return lignes.size();
    }
}
