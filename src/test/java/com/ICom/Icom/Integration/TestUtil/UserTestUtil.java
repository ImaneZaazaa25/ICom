package com.ICom.Icom.Integration.TestUtil;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Classe utilitaire pour les opérations d'authentification dans les tests d'intégration.
 * Partagée entre toutes les classes de tests qui nécessitent un signup/signin.
 *
 * Rôles disponibles dans l'application : "Admin", "User" (enum Role).
 */
public class UserTestUtil {

    private final MockMvc mockMvc;

    public UserTestUtil(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    /**
     * Inscrit un utilisateur. N'échoue pas si l'utilisateur existe déjà.
     *
     * @param role "Admin" ou "User"
     */
    public void signup(String username, String email, String password, String role) throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "nom": "Test",
                            "prenom": "User",
                            "username": "%s",
                            "email": "%s",
                            "motdepasse": "%s",
                            "role": "%s",
                            "tel": "0600000000",
                            "status": "Active"
                        }
                        """.formatted(username, email, password, role)));
    }

    /**
     * Inscrit un utilisateur avec le rôle "User" (client de la boutique).
     */
    public void signupClient(String username, String email, String password) throws Exception {
        signup(username, email, password, "User");
    }

    /**
     * Inscrit un utilisateur avec le rôle "Admin".
     */
    public void signupAdmin(String username, String email, String password) throws Exception {
        signup(username, email, password, "Admin");
    }

    /**
     * Connecte un utilisateur et retourne son token JWT.
     */
    public String signin(String username, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "%s",
                                    "motdepasse": "%s"
                                }
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
    }
}
