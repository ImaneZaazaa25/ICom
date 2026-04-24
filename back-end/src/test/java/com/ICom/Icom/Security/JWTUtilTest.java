package com.ICom.Icom.Security;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires du JWTUtil
 *
 * Objectif :
 * - Vérifier la génération du token JWT
 * - Vérifier l’extraction des données (username)
 * - Vérifier la validation du token
 */
@ActiveProfiles("test")
@Transactional
@SpringBootTest
class JWTUtilTest {

    @Autowired
    private JWTUtil jwtUtil;

    /**
     * Test complet du cycle JWT :
     * génération → parsing → validation
     */
    @Test
    void testGenerateAndValidateToken() {

        // 1. Création d’un utilisateur simulé (UserDetails Spring Security)
        UserDetails userDetails = new User(
                "imane", // username
                "password", // password (non utilisé ici)
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")) // rôle utilisateur
        );

        // 2. Génération du token JWT
        String token = jwtUtil.generateToken(userDetails);

        // Vérifie que le token est bien généré (non null)
        assertNotNull(token);

        // 3. Extraction des informations depuis le token
        String username = jwtUtil.getUserFromToken(token);

        // Vérifie que le username extrait correspond à celui utilisé
        assertEquals("imane", username);

        // 4. Validation du token JWT
        boolean isValid = jwtUtil.validateJwtToken(token);

        // Vérifie que le token est valide (signature + expiration + format)
        assertTrue(isValid);
    }
}