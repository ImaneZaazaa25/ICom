package com.ICom.Icom.Integration.E2ETest;


import com.ICom.Icom.Integration.TestUtil.UserTestUtil;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserE2ETest {

    @Autowired
    private MockMvc mockMvc;

    // =========================
    // 🎬 SCÉNARIO GLOBAL
    // =========================
    @Test
    void scenarioCompletUtilisateur() throws Exception {

        UserTestUtil userTestUtil = new UserTestUtil(mockMvc);

        // ÉTAPE 1 — Inscription
        userTestUtil.signupClient("jean.dupont", "jean@test.com", "password123");

        // ÉTAPE 2 — Connexion → récupère le token
        String token = userTestUtil.signin("jean.dupont", "password123");

        // ÉTAPE 3 — Consulter son profil
        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("jean.dupont"))
                .andExpect(jsonPath("$.nom").value("Test"))
                .andExpect(jsonPath("$.email").value("jean@test.com"));

        // ÉTAPE 4 — Modifier nom et email
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
                .andExpect(jsonPath("$.prenom").value("User"))      // ← inchangé
                .andExpect(jsonPath("$.tel").value("0600000000"));  // ← inchangé

        // ÉTAPE 5 — Vérifier que les changements sont bien en base
        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Martin"))
                .andExpect(jsonPath("$.email").value("jean.martin@test.com"));

        // ÉTAPE 6 — Changer le mot de passe
        mockMvc.perform(put("/api/user/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "motdepasse": "nouveauPass99"
                        }
                        """))
                .andExpect(status().isOk());

        // ÉTAPE 7 — Se reconnecter avec le nouveau mot de passe
        String nouveauToken = userTestUtil.signin("jean.dupont", "nouveauPass99");

        // ÉTAPE 8 — Accéder au profil avec le nouveau token
        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + nouveauToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("jean.dupont"));

        
    }
}