package com.ICom.Icom.Integration;

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
 * Tests d'intégration indépendants pour chaque endpoint du CommandeController.
 *
 * Stratégie :
 *  - Un Admin initialise le catalogue (catégorie + produits).
 *  - Un User (rôle "User" = client) effectue les opérations panier et commande.
 *  - @BeforeEach s'exécute dans la même transaction que le @Test → rollback automatique.
 *  - UserTestUtil, PanierTestUtil et CommandeTestUtil centralisent les appels HTTP.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CommandeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private UserTestUtil    userUtil;
    private PanierTestUtil  panierUtil;
    private CommandeTestUtil commandeUtil;

    /** Token Admin pour gérer le catalogue. */
    private String adminToken;

    /** Token du client (rôle "User") pour les opérations panier et commande. */
    private String clientToken;

    /** Produit actif : prix = 25.0, stock = 10. */
    private Long produitId;

    @BeforeEach
    void setUp() throws Exception {
        userUtil     = new UserTestUtil(mockMvc);
        panierUtil   = new PanierTestUtil(mockMvc);
        commandeUtil = new CommandeTestUtil(mockMvc);

        // -- Admin : crée le catalogue
        userUtil.signupAdmin("adminCmdTest", "adminCmdTest@test.com", "admin123");
        adminToken = userUtil.signin("adminCmdTest", "admin123");

        Long categoryId = panierUtil.creerCategorie(adminToken, "CatCommandeTest");
        produitId = panierUtil.creerProduit(adminToken, "ProduitCmd", 25.0, 10, true, categoryId);

        // -- Client (rôle "User") : passe les commandes
        userUtil.signupClient("clientCmdTest", "clientCmdTest@test.com", "client123");
        clientToken = userUtil.signin("clientCmdTest", "client123");
    }

    // ==========================================================================
    // POST /api/commandes — validerPanier
    // ==========================================================================

    @Test
    void testValiderPanier_Succes_Retourne201AvecCommandeValidee() throws Exception {
        // Préparer le panier
        panierUtil.ajouterProduit(clientToken, produitId, 3).andExpect(status().isCreated());

        // Valider → commande créée avec état VALIDEE et total = 3 × 25.0
        commandeUtil.validerPanier(clientToken)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.etat").value("VALIDEE"))
                .andExpect(jsonPath("$.lignes.length()").value(1))
                .andExpect(jsonPath("$.lignes[0].produitId").value(produitId))
                .andExpect(jsonPath("$.lignes[0].quantite").value(3))
                .andExpect(jsonPath("$.lignes[0].prixUnitaire").value(25.0))
                .andExpect(jsonPath("$.lignes[0].sousTotal").value(75.0))
                .andExpect(jsonPath("$.total").value(75.0));
    }

    @Test
    void testValiderPanier_VideLePanierApresValidation() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2).andExpect(status().isCreated());
        commandeUtil.validerPanier(clientToken).andExpect(status().isCreated());

        // Le panier doit être vide après la validation
        panierUtil.getPanier(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lignes").isEmpty())
                .andExpect(jsonPath("$.total").value(0.0));
    }

    @Test
    void testValiderPanier_PanierVide_Retourne400() throws Exception {
        // Créer le panier (GET le crée automatiquement) mais ne rien ajouter
        panierUtil.getPanier(clientToken).andExpect(status().isOk());

        commandeUtil.validerPanier(clientToken)
                .andExpect(status().isBadRequest());
    }

    @Test
    void testValiderPanier_SansPanier_Retourne400() throws Exception {
        // Ne jamais accéder au panier → aucun panier en base → 400
        commandeUtil.validerPanier(clientToken)
                .andExpect(status().isBadRequest());
    }

    @Test
    void testValiderPanier_ProduitDevenantInactif_Retourne400() throws Exception {
        // Ajouter le produit actif au panier
        panierUtil.ajouterProduit(clientToken, produitId, 1).andExpect(status().isCreated());

        // Admin désactive le produit après l'ajout
        panierUtil.desactiverProduit(adminToken, produitId);

        // Validation refusée car le produit est maintenant inactif
        commandeUtil.validerPanier(clientToken)
                .andExpect(status().isBadRequest());
    }

    @Test
    void testValiderPanier_SansAuthentification_Retourne401() throws Exception {
        mockMvc.perform(post("/api/commandes"))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================================================
    // GET /api/commandes — getMesCommandes
    // ==========================================================================

    @Test
    void testGetMesCommandes_PasDeCommande_RetourneListeVide() throws Exception {
        commandeUtil.getMesCommandes(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void testGetMesCommandes_ApresValidation_RetourneUneCommande() throws Exception {
        panierUtil.ajouterProduit(clientToken, produitId, 2).andExpect(status().isCreated());
        commandeUtil.validerPanier(clientToken).andExpect(status().isCreated());

        commandeUtil.getMesCommandes(clientToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].etat").value("VALIDEE"))
                .andExpect(jsonPath("$[0].total").value(50.0))
                .andExpect(jsonPath("$[0].lignes.length()").value(1));
    }

    @Test
    void testGetMesCommandes_HistoriqueIsolerParClient() throws Exception {
        // Le client commande
        panierUtil.ajouterProduit(clientToken, produitId, 1).andExpect(status().isCreated());
        commandeUtil.validerPanier(clientToken).andExpect(status().isCreated());

        // Un autre client ne doit pas voir cette commande
        userUtil.signupClient("autreClientCmd", "autreClientCmd@test.com", "client123");
        String autreToken = userUtil.signin("autreClientCmd", "client123");

        commandeUtil.getMesCommandes(autreToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void testGetMesCommandes_SansAuthentification_Retourne401() throws Exception {
        mockMvc.perform(get("/api/commandes"))
                .andExpect(status().isUnauthorized());
    }
}
