package com.ICom.Icom.Integration;

import com.ICom.Icom.Integration.TestUtil.PanierTestUtil;
import com.ICom.Icom.Integration.TestUtil.UserTestUtil;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration du PanierController.
 * Vérifie les comportements réels de l’API avec Spring Security + DB + services.
 *
 * Objectif :
 * - Tester ajout / modification / suppression du panier
 * - Vérifier les règles métier (stock, produit inactif, permissions)
 * - Vérifier la sécurité (403 / 401)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PanierControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private UserTestUtil userUtil;
    private PanierTestUtil panierUtil;

    // Token utilisateur principal (client connecté)
    private String clientToken;

    // Token d’un autre client pour tester les accès interdits (403)
    private String autreClientToken;

    // Produit actif utilisé dans les tests (stock suffisant)
    private Long produitId;

    // Produit inactif pour tester les règles métier
    private Long produitInactifId;

    @BeforeEach
    void setUp() throws Exception {

        // Initialisation des utilitaires de test
        userUtil   = new UserTestUtil(mockMvc);
        panierUtil = new PanierTestUtil(mockMvc);

        // Création d’un admin pour préparer le catalogue
        userUtil.signupAdmin("adminSetupPanier", "adminSetupPanier@test.com", "admin123");
        String adminToken = userUtil.signin("adminSetupPanier", "admin123");

        // Création d’une catégorie et de produits de test
        Long categoryId  = panierUtil.creerCategorie(adminToken, "CatPanierTest");

        produitId = panierUtil.creerProduit(
                adminToken,
                "ProduitActif",
                15.0,
                10,
                true,
                categoryId
        );

        produitInactifId = panierUtil.creerProduit(
                adminToken,
                "ProduitInactif",
                10.0,
                5,
                false,
                categoryId
        );

        // Création du client principal
        userUtil.signupClient("clientPanierTest", "clientPanierTest@test.com", "client123");
        clientToken = userUtil.signin("clientPanierTest", "client123");

        // Création d’un second client pour tester les accès interdits
        userUtil.signupClient("autreClientTest", "autreClientTest@test.com", "client123");
        autreClientToken = userUtil.signin("autreClientTest", "client123");
    }

    /**
     * Vérifie que le panier est correctement retourné (vide au départ)
     */
    @Test
    void testGetPanier_RetournePanierVide() throws Exception {
        panierUtil.getPanier(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes").isArray())
                .andExpect(jsonPath("$.lignes").isEmpty())
                .andExpect(jsonPath("$.total").value(0.0));
    }

    /**
     * Vérifie qu’un utilisateur non authentifié reçoit 401
     */
    @Test
    void testGetPanier_SansAuthentification_Retourne401() throws Exception {
        mockMvc.perform(get("/api/panier"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Ajout d’un produit dans le panier
     * Vérifie création correcte de la ligne + calcul total
     */
    @Test
    void testAjouterProduit_Succes_Retourne201AvecLigne() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lignes.length()").value(1))
                .andExpect(jsonPath("$.lignes[0].quantite").value(2))
                .andExpect(jsonPath("$.total").value(30.0));
    }

    /**
     * Ajout du même produit deux fois → doit cumuler les quantités
     */
    @Test
    void testAjouterMemeProduit_DeuxFois_CumuleQuantite() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2);
        panierUtil.ajouterProduit(clientToken, produitId, 3)
                .andExpect(jsonPath("$.lignes[0].quantite").value(5));
    }

    /**
     * Produit inexistant → 404 attendu
     */
    @Test
    void testAjouterProduit_ProduitInexistant_Retourne404() throws Exception {
        panierUtil.ajouterProduit(clientToken, 99999L, 1)
                .andExpect(status().isNotFound());
    }

    /**
     * Stock insuffisant → rejet métier (400)
     */
    @Test
    void testAjouterProduit_StockInsuffisant_Retourne400() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 999)
                .andExpect(status().isBadRequest());
    }

    /**
     * Produit désactivé → impossible d’ajouter au panier
     */
    @Test
    void testAjouterProduit_ProduitInactif_Retourne400() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitInactifId, 1)
                .andExpect(status().isBadRequest());
    }

    /**
     * Test validation Bean Validation (@Min)
     */
    @Test
    void testAjouterProduit_QuantiteZero_Retourne400() throws Exception {
        mockMvc.perform(post("/api/panier/items")
                        .header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"produitId": %d, "quantite": 0}
                                """.formatted(produitId)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Modification de quantité d’une ligne existante
     */
    @Test
    void testModifierQuantite_Succes() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2);
        Long ligneId = panierUtil.getLigneIdPourProduit(clientToken, produitId);

        panierUtil.modifierQuantite(clientToken, ligneId, 5)
                .andExpect(jsonPath("$.lignes[0].quantite").value(5));
    }

    /**
     * Tentative de modification sur une ligne d’un autre utilisateur → 403
     */
    @Test
    void testModifierQuantite_LigneAutreClient_Retourne403() throws Exception {
        panierUtil.ajouterProduit(autreClientToken, produitId, 1);
        Long ligneId = panierUtil.getLigneIdPourProduit(autreClientToken, produitId);

        panierUtil.modifierQuantite(clientToken, ligneId, 2)
                .andExpect(status().isForbidden());
    }

    /**
     * Suppression d’une ligne → panier vide attendu
     */
    @Test
    void testSupprimerLigne_Succes_PanierVide() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2);
        Long ligneId = panierUtil.getLigneIdPourProduit(clientToken, produitId);

        panierUtil.supprimerLigne(clientToken, ligneId)
                .andExpect(jsonPath("$.lignes").isEmpty());
    }

    /**
     * Suppression d’une ligne inexistante → 404
     */
    @Test
    void testSupprimerLigne_LigneInexistante_Retourne404() throws Exception {
        panierUtil.supprimerLigne(clientToken, 99999L)
                .andExpect(status().isNotFound());
    }

    /**
     * Suppression d’une ligne appartenant à un autre utilisateur → 403
     */
    @Test
    void testSupprimerLigne_LigneAutreClient_Retourne403() throws Exception {
        panierUtil.ajouterProduit(autreClientToken, produitId, 1);
        Long ligneId = panierUtil.getLigneIdPourProduit(autreClientToken, produitId);

        panierUtil.supprimerLigne(clientToken, ligneId)
                .andExpect(status().isForbidden());
    }
}