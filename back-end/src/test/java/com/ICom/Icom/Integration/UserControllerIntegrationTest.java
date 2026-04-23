package com.ICom.Icom.Integration;

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
 * Tests d'intégration du UserController
 *
 * Objectif :
 * - Tester récupération du profil utilisateur (GET)
 * - Tester mise à jour du profil (PUT)
 * - Tester sécurité JWT (401 sans token)
 * - Vérifier cohérence avec base de données réelle
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    // Utilitaire pour gérer signup + signin + token JWT
    private UserTestUtil userTestUtil;

    // Token JWT du user utilisé dans les tests
    private String token;

    /**
     * Initialisation avant chaque test :
     * - création d’un utilisateur
     * - authentification
     * - récupération du token JWT
     */
    @BeforeEach
    void setUp() throws Exception {

        userTestUtil = new UserTestUtil(mockMvc);

        // Création d’un utilisateur de test
        userTestUtil.signupClient(
                "jean.dupont",
                "jean@test.com",
                "password123"
        );

        // Authentification pour obtenir le token JWT
        token = userTestUtil.signin(
                "jean.dupont",
                "password123"
        );
    }

    // ======================================================
    // TEST 1 — Récupération du profil utilisateur
    // ======================================================

    /**
     * Vérifie que :
     * - l'utilisateur connecté peut récupérer son profil
     * - les données retournées sont correctes
     */
    @Test
    void testGetProfile() throws Exception {

        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("jean.dupont"))
                .andExpect(jsonPath("$.nom").value("Test"))
                .andExpect(jsonPath("$.email").value("jean@test.com"));
    }

    // ======================================================
    // TEST 2 — Mise à jour du profil utilisateur
    // ======================================================

    /**
     * Vérifie que :
     * - les champs modifiables sont bien mis à jour
     * - les champs non envoyés restent inchangés
     */
    @Test
    void testUpdateProfile() throws Exception {

        mockMvc.perform(put("/api/user/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "nom": "Martin",
                            "email": "jean.martin@test.com"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Martin"))
                .andExpect(jsonPath("$.email").value("jean.martin@test.com"))
                .andExpect(jsonPath("$.prenom").value("User")); // champ non modifié
    }

    // ======================================================
    // TEST 3 — Accès sans authentification
    // ======================================================

    /**
     * Vérifie la sécurité :
     * - un utilisateur sans token ne peut pas accéder au profil
     * - réponse attendue : 401 Unauthorized
     */
    @Test
    void testUnauthorizedWithoutToken() throws Exception {

        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized());
    }
}