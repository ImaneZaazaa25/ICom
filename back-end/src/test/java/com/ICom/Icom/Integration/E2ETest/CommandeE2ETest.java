package com.ICom.Icom.Integration.E2ETest;

import com.ICom.Icom.Integration.TestUtil.CommandeTestUtil;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test end-to-end simulant le flux complet d'un client de la boutique :
 *
 *  1. Voir le panier vide
 *  2. Ajouter deux produits au panier
 *  3. Vérifier le contenu du panier avant validation
 *  4. Valider le panier → création de la commande
 *  5. Vérifier que le panier est vide après validation
 *  6. Vérifier l'historique des commandes
 *  7. Vérifier que le stock a été décrémenté
 *
 * Séparation des responsabilités :
 *  - UserTestUtil    → signup/signin
 *  - PanierTestUtil  → création catalogue + opérations panier
 *  - CommandeTestUtil → validation et historique des commandes
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CommandeE2ETest {

    @Autowired
    private MockMvc mockMvc;

    private UserTestUtil     userUtil;
    private PanierTestUtil   panierUtil;
    private CommandeTestUtil commandeUtil;

    /** Token du client (rôle "User"). */
    private String clientToken;

    /** Produit 1 : prix = 30.0, stock = 10 */
    private Long produitId1;

    /** Produit 2 : prix = 50.0, stock = 5 */
    private Long produitId2;

    @BeforeEach
    void setUp() throws Exception {
        userUtil     = new UserTestUtil(mockMvc);
        panierUtil   = new PanierTestUtil(mockMvc);
        commandeUtil = new CommandeTestUtil(mockMvc);

        // -- Admin : prépare le catalogue
        userUtil.signupAdmin("adminE2ECmd", "adminE2ECmd@test.com", "admin123");
        String adminToken = userUtil.signin("adminE2ECmd", "admin123");

        Long categoryId = panierUtil.creerCategorie(adminToken, "CatE2ECmd");
        produitId1 = panierUtil.creerProduit(adminToken, "Produit Cmd 1", 30.0, 10, true, categoryId);
        produitId2 = panierUtil.creerProduit(adminToken, "Produit Cmd 2", 50.0, 5,  true, categoryId);

        // -- Client (rôle "User") : simule un acheteur de la boutique
        userUtil.signupClient("clientE2ECmd", "clientE2ECmd@test.com", "client123");
        clientToken = userUtil.signin("clientE2ECmd", "client123");
    }

    @Test
    void testFluxCompletCommandeDepuisPanier() throws Exception {

        // ==================================================================
        // Étape 1 : Panier initial — doit être vide
        // ==================================================================
        panierUtil.getPanier(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes").isEmpty())
                .andExpect(jsonPath("$.total").value(0.0));

        // ==================================================================
        // Étape 2 : Remplir le panier
        //           Produit 1 : 2 unités × 30.0 = 60.0
        //           Produit 2 : 1 unité  × 50.0 = 50.0
        // ==================================================================
        panierUtil.ajouterProduit(clientToken, produitId1, 2).andExpect(status().isCreated());
        panierUtil.ajouterProduit(clientToken, produitId2, 1).andExpect(status().isCreated());

        // ==================================================================
        // Étape 3 : Vérifier le panier avant validation
        //           Total attendu : 60.0 + 50.0 = 110.0
        // ==================================================================
        panierUtil.getPanier(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes.length()").value(2))
                .andExpect(jsonPath("$.total").value(110.0));

        // ==================================================================
        // Étape 4 : Valider le panier → commande créée
        //           État attendu : VALIDEE, total = 110.0, 2 lignes
        // ==================================================================
        commandeUtil.validerPanier(clientToken)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.etat").value("VALIDEE"))
                .andExpect(jsonPath("$.lignes.length()").value(2))
                .andExpect(jsonPath("$.total").value(110.0));

        // ==================================================================
        // Étape 5 : Panier vide après validation
        // ==================================================================
        panierUtil.getPanier(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes").isEmpty())
                .andExpect(jsonPath("$.total").value(0.0));

        // ==================================================================
        // Étape 6 : Historique des commandes — 1 commande VALIDEE
        // ==================================================================
        commandeUtil.getMesCommandes(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].etat").value("VALIDEE"))
                .andExpect(jsonPath("$[0].total").value(110.0))
                .andExpect(jsonPath("$[0].lignes.length()").value(2))
                .andExpect(jsonPath("$[0].lignes[0].prixUnitaire").exists())
                .andExpect(jsonPath("$[0].dateCommande").exists());

        // ==================================================================
        // Étape 7 : Vérifier que le stock a été décrémenté
        //           Produit 1 : 10 - 2 = 8
        //           Produit 2 :  5 - 1 = 4
        // ==================================================================
        mockMvc.perform(get("/api/produits/{id}", produitId1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantite").value(8));

        mockMvc.perform(get("/api/produits/{id}", produitId2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantite").value(4));
    }
}
