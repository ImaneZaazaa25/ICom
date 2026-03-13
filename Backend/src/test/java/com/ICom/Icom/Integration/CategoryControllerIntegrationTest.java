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
class CategoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testAdminCreateCategoryAndAccessEndpoints() throws Exception {

        // =========================
        //SIGNUP Admin
        // =========================
        String signupResponse = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "nom": "Admina",
                            "prenom": "Test",
                            "username": "adminaCategory",
                            "email": "adminCategory@test.com",
                            "motdepasse": "admin123",
                            "role": "Admin",
                            "tel": "0700000000",
                            "status": "Active"
                        }
                        """))
                .andReturn()
                .getResponse()
                .getContentAsString();

        if (!signupResponse.equals("User enregistrer avec succes")) {
            System.out.println("Utilisateur existe déjà : " + signupResponse);
        }

        // =========================
        //  SIGNIN
        // =========================
        String token = mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "username": "adminaCategory",
                            "motdepasse": "admin123"
                        }
                        """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // =========================
        // CREATE CATEGORY (Protégé Admin)
        // =========================
        String categoryResponse = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "nom": "IntegrationTestCategory"
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("IntegrationTestCategory"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // =========================
        //  GET ALL CATEGORIES
        // =========================
        mockMvc.perform(get("/api/categories")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // =========================
        // CHECK EXISTS (Protégé Admin)
        // =========================
        mockMvc.perform(get("/api/categories/exists")
                        .param("nom", "IntegrationTestCategory")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }
}