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
class CategoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testAdminCreateCategoryAndAccessEndpoints() throws Exception {

        // =========================
        // 1️⃣ SIGNUP Admin
        // =========================
        String signupResponse = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "nom": "Admin",
                            "prenom": "Test",
                            "username": "adminCategory",
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
        // 2️⃣ SIGNIN
        // =========================
        String token = mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "username": "adminCategory",
                            "motdepasse": "admin123"
                        }
                        """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // =========================
        // 3️⃣ CREATE CATEGORY (Protégé Admin)
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
        // 4️⃣ GET ALL CATEGORIES
        // =========================
        mockMvc.perform(get("/api/categories")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // =========================
        // 5️⃣ CHECK EXISTS (Protégé Admin)
        // =========================
        mockMvc.perform(get("/api/categories/exists")
                        .param("nom", "IntegrationTestCategory")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }
}