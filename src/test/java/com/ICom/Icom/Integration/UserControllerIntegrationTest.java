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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private UserTestUtil userTestUtil;
    private String token;

    @BeforeEach
    void setUp() throws Exception {
        userTestUtil = new UserTestUtil(mockMvc);

        userTestUtil.signupClient("jean.dupont", "jean@test.com", "password123");
        token = userTestUtil.signin("jean.dupont", "password123");
    }

    // =========================
    // TEST 1 — GET profile
    // =========================
    @Test
    void testGetProfile() throws Exception {
        mockMvc.perform(get("/api/user/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("jean.dupont"))
                .andExpect(jsonPath("$.nom").value("Test"))
                .andExpect(jsonPath("$.email").value("jean@test.com"));
    }

    // =========================
    // TEST 2 — PUT profile
    // =========================
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
                .andExpect(jsonPath("$.prenom").value("User")); // ← inchangé
    }

    // =========================
    // TEST 3 — Sans token → 401
    // =========================
    @Test
    void testUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized());
    }
}