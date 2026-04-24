package com.ICom.Icom.Integration;

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
class JwtIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testSignupThenLoginAndAccessProtectedEndpoint() throws Exception {

        String username = "safwan25";

        // 1️⃣ inscription utilisateur (signup)
        String signupResponse = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "nom": "Mounassir",
                            "prenom": "Safwan",
                            "username": "safwan25",
                            "email": "safwan@test.com",
                            "motdepasse": "safwan2511",
                            "role": "Admin",
                            "tel": "0700000000",
                            "status": "Active"
                        }
                        """))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // si utilisateur existe déjà, on continue le test
        if (!signupResponse.equals("User enregistrer avec succes")) {
            System.out.println("Utilisateur existe déjà : " + signupResponse);
        }

        // 2️⃣ connexion utilisateur (signin) pour récupérer le JWT
        String token = mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "username": "safwan25",
                            "motdepasse": "safwan2511"
                        }
                        """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 3️⃣ accès à un endpoint protégé avec le token JWT
        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}