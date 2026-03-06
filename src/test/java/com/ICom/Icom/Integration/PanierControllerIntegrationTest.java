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
 * Tests d'intégration indépendants pour chaque endpoint du PanierController.
 *
 * Stratégie :
 *  - Un Admin est créé pour initialiser le catalogue (catégorie + produits).
 *  - Un User (rôle "User" = client) est créé pour les opérations panier.
 *  - @BeforeEach s'exécute dans la même transaction que le @Test → rollback automatique.
 *  - UserTestUtil gère l'auth ; PanierTestUtil gère le catalogue et le panier.
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

    /** Token du client (rôle "User") utilisé pour les opérations panier. */
    private String clientToken;

    /** Token d'un second client pour tester les accès croisés (403). */
    private String autreClientToken;

    /** Produit actif avec stock = 10, prix = 15.0. */
    private Long produitId;

    /** Produit inactif pour tester le refus d'ajout. */
    private Long produitInactifId;

    @BeforeEach
    void setUp() throws Exception {
        userUtil   = new UserTestUtil(mockMvc);
        panierUtil = new PanierTestUtil(mockMvc);

        // -- Admin : crée le catalogue (catégories + produits)
        userUtil.signupAdmin("adminSetupPanier", "adminSetupPanier@test.com", "admin123");
        String adminToken = userUtil.signin("adminSetupPanier", "admin123");

        Long categoryId  = panierUtil.creerCategorie(adminToken, "CatPanierTest");
        produitId        = panierUtil.creerProduit(adminToken, "ProduitActif",   15.0, 10, true,  categoryId);
        produitInactifId = panierUtil.creerProduit(adminToken, "ProduitInactif", 10.0, 5,  false, categoryId);

        // -- Client principal (rôle "User") : effectue les opérations panier
        userUtil.signupClient("clientPanierTest", "clientPanierTest@test.com", "client123");
        clientToken = userUtil.signin("clientPanierTest", "client123");

        // -- Second client : pour les tests d'accès croisé (403)
        userUtil.signupClient("autreClientTest", "autreClientTest@test.com", "client123");
        autreClientToken = userUtil.signin("autreClientTest", "client123");
    }

    // ==========================================================================
    // GET /api/panier
    // ==========================================================================

    @Test
    void testGetPanier_RetournePanierVide() throws Exception {
        panierUtil.getPanier(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes").isArray())
                .andExpect(jsonPath("$.lignes").isEmpty())
                .andExpect(jsonPath("$.total").value(0.0));
    }

    @Test
    void testGetPanier_SansAuthentification_Retourne401() throws Exception {
        mockMvc.perform(get("/api/panier"))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================================================
    // POST /api/panier/items
    // ==========================================================================

    @Test
    void testAjouterProduit_Succes_Retourne201AvecLigne() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lignes.length()").value(1))
                .andExpect(jsonPath("$.lignes[0].produitId").value(produitId))
                .andExpect(jsonPath("$.lignes[0].quantite").value(2))
                .andExpect(jsonPath("$.lignes[0].prixUnitaire").value(15.0))
                .andExpect(jsonPath("$.lignes[0].sousTotal").value(30.0))
                .andExpect(jsonPath("$.total").value(30.0));
    }

    @Test
    void testAjouterMemeProduit_DeuxFois_CumuleQuantite() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2).andExpect(status().isCreated());

        // Le second ajout doit cumuler : 2 + 3 = 5
        panierUtil.ajouterProduit(clientToken, produitId, 3)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lignes.length()").value(1))
                .andExpect(jsonPath("$.lignes[0].quantite").value(5))
                .andExpect(jsonPath("$.total").value(75.0));
    }

    @Test
    void testAjouterProduit_ProduitInexistant_Retourne404() throws Exception {
        panierUtil.ajouterProduit(clientToken, 99999L, 1)
                .andExpect(status().isNotFound());
    }

    @Test
    void testAjouterProduit_StockInsuffisant_Retourne400() throws Exception {
        // Stock disponible = 10, on demande 999
        panierUtil.ajouterProduit(clientToken, produitId, 999)
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAjouterProduit_ProduitInactif_Retourne400() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitInactifId, 1)
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAjouterProduit_QuantiteZero_Retourne400() throws Exception {
        // La validation @Min(1) doit rejeter quantite = 0
        mockMvc.perform(post("/api/panier/items")
                        .header("Authorization", "Bearer " + clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"produitId": %d, "quantite": 0}
                                """.formatted(produitId)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAjouterProduit_SansAuthentification_Retourne401() throws Exception {
        mockMvc.perform(post("/api/panier/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"produitId": %d, "quantite": 1}
                                """.formatted(produitId)))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================================================
    // PUT /api/panier/items/{ligneId}
    // ==========================================================================

    @Test
    void testModifierQuantite_Succes() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2).andExpect(status().isCreated());
        Long ligneId = panierUtil.getLigneIdPourProduit(clientToken, produitId);

        panierUtil.modifierQuantite(clientToken, ligneId, 5)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes[0].quantite").value(5))
                .andExpect(jsonPath("$.total").value(75.0));
    }

    @Test
    void testModifierQuantite_StockInsuffisant_Retourne400() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2).andExpect(status().isCreated());
        Long ligneId = panierUtil.getLigneIdPourProduit(clientToken, produitId);

        // Stock = 10, on demande 999
        panierUtil.modifierQuantite(clientToken, ligneId, 999)
                .andExpect(status().isBadRequest());
    }

    @Test
    void testModifierQuantite_LigneInexistante_Retourne404() throws Exception {
        panierUtil.modifierQuantite(clientToken, 99999L, 1)
                .andExpect(status().isNotFound());
    }

    @Test
    void testModifierQuantite_LigneAutreClient_Retourne403() throws Exception {
        // L'autre client ajoute un produit dans son propre panier
        panierUtil.ajouterProduit(autreClientToken, produitId, 1).andExpect(status().isCreated());
        Long autresLigneId = panierUtil.getLigneIdPourProduit(autreClientToken, produitId);

        // Le client principal tente de modifier la ligne de l'autre → 403
        panierUtil.modifierQuantite(clientToken, autresLigneId, 2)
                .andExpect(status().isForbidden());
    }

    // ==========================================================================
    // DELETE /api/panier/items/{ligneId}
    // ==========================================================================

    @Test
    void testSupprimerLigne_Succes_PanierVide() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2).andExpect(status().isCreated());
        Long ligneId = panierUtil.getLigneIdPourProduit(clientToken, produitId);

        panierUtil.supprimerLigne(clientToken, ligneId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes").isEmpty())
                .andExpect(jsonPath("$.total").value(0.0));
    }

    @Test
    void testSupprimerLigne_LigneInexistante_Retourne404() throws Exception {
        panierUtil.supprimerLigne(clientToken, 99999L)
                .andExpect(status().isNotFound());
    }

    @Test
    void testSupprimerLigne_LigneAutreClient_Retourne403() throws Exception {
        // L'autre client ajoute un produit dans son propre panier
        panierUtil.ajouterProduit(autreClientToken, produitId, 1).andExpect(status().isCreated());
        Long autresLigneId = panierUtil.getLigneIdPourProduit(autreClientToken, produitId);

        // Le client principal tente de supprimer la ligne de l'autre → 403
        panierUtil.supprimerLigne(clientToken, autresLigneId)
                .andExpect(status().isForbidden());
    }
}
