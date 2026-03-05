package com.ICom.Icom.Integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest
@AutoConfigureMockMvc
class JwtIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testSignupThenLoginAndAccessProtectedEndpoint() throws Exception {

        String username = "safwan25";

        // 1️⃣ SIGNUP pour créer l'utilisateur
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

        // Si l'utilisateur existe déjà, juste afficher le message et continuer
        if (!signupResponse.equals("User enregistrer avec succes")) {
            System.out.println("Utilisateur existe déjà : " + signupResponse);
        }

        // 2️⃣ SIGNIN pour récupérer le token
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

        // 3️⃣ Accéder à un endpoint protégé avec le token
        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}