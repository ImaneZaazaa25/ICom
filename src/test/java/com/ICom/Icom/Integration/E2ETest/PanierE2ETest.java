package com.ICom.Icom.Integration.E2ETest;

import com.ICom.Icom.Integration.TestUtil.PanierTestUtil;
import com.ICom.Icom.Integration.TestUtil.UserTestUtil;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test end-to-end simulant le flux complet d'un client sur son panier :
 *
 *  1. Voir le panier vide
 *  2. Ajouter le produit 1
 *  3. Ajouter le produit 2
 *  4. Modifier la quantité du produit 1
 *  5. Supprimer la ligne du produit 2
 *  6. Vérifier l'état final du panier
 *
 * Séparation des responsabilités :
 *  - UserTestUtil  → signup/signin (Admin pour le setup, User pour le client)
 *  - PanierTestUtil → création du catalogue et toutes les opérations panier
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PanierE2ETest {

    @Autowired
    private MockMvc mockMvc;

    private UserTestUtil userUtil;
    private PanierTestUtil panierUtil;

    /** Token du client (rôle "User") qui navigue et remplit son panier. */
    private String clientToken;

    /** Produit 1 : prix = 20.0, stock = 10 */
    private Long produitId1;

    /** Produit 2 : prix = 35.0, stock = 5 */
    private Long produitId2;

    @BeforeEach
    void setUp() throws Exception {
        userUtil   = new UserTestUtil(mockMvc);
        panierUtil = new PanierTestUtil(mockMvc);

        // -- Admin : prépare le catalogue
        userUtil.signupAdmin("adminE2EPanier", "adminE2EPanier@test.com", "admin123");
        String adminToken = userUtil.signin("adminE2EPanier", "admin123");

        Long categoryId = panierUtil.creerCategorie(adminToken, "CatE2E");
        produitId1 = panierUtil.creerProduit(adminToken, "Produit E2E 1", 20.0, 10, true, categoryId);
        produitId2 = panierUtil.creerProduit(adminToken, "Produit E2E 2", 35.0, 5,  true, categoryId);

        // -- Client (rôle "User") : simule un utilisateur de la boutique
        userUtil.signupClient("clientE2EPanier", "clientE2EPanier@test.com", "client123");
        clientToken = userUtil.signin("clientE2EPanier", "client123");
    }

    @Test
    void testFluxCompletPanier() throws Exception {

        // ==================================================================
        // Étape 1 : Panier initial — doit être vide
        // ==================================================================
        panierUtil.getPanier(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes").isEmpty())
                .andExpect(jsonPath("$.total").value(0.0));

        // ==================================================================
        // Étape 2 : Ajouter produit 1 
        // ==================================================================
        panierUtil.ajouterProduit(clientToken, produitId1, 2)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lignes.length()").value(1))
                .andExpect(jsonPath("$.lignes[0].produitId").value(produitId1))
                .andExpect(jsonPath("$.lignes[0].quantite").value(2))
                .andExpect(jsonPath("$.lignes[0].sousTotal").value(40.0))
                .andExpect(jsonPath("$.total").value(40.0));

        // ==================================================================
        // Étape 3 : Ajouter produit 2
        // ==================================================================
        panierUtil.ajouterProduit(clientToken, produitId2, 1)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lignes.length()").value(2))
                .andExpect(jsonPath("$.total").value(75.0));

        // ==================================================================
        // Étape 4 : Modifier la quantité du produit 1
        // ==================================================================
        Long ligneProduit1Id = panierUtil.getLigneIdPourProduit(clientToken, produitId1);

        panierUtil.modifierQuantite(clientToken, ligneProduit1Id, 3)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(95.0));

        // ==================================================================
        // Étape 5 : Supprimer la ligne du produit 2
        // ==================================================================
        Long ligneProduit2Id = panierUtil.getLigneIdPourProduit(clientToken, produitId2);

        panierUtil.supprimerLigne(clientToken, ligneProduit2Id)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes.length()").value(1))
                .andExpect(jsonPath("$.total").value(60.0));

        // ==================================================================
        // Étape 6 : Vérification de l'état final via GET /api/panier
        //           1 ligne : produit1, qté=3, prixUnitaire=20.0, sousTotal=60.0
        // ==================================================================
        panierUtil.getPanier(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes.length()").value(1))
                .andExpect(jsonPath("$.lignes[0].produitId").value(produitId1))
                .andExpect(jsonPath("$.lignes[0].quantite").value(3))
                .andExpect(jsonPath("$.lignes[0].prixUnitaire").value(20.0))
                .andExpect(jsonPath("$.lignes[0].sousTotal").value(60.0))
                .andExpect(jsonPath("$.total").value(60.0));
    }
}
