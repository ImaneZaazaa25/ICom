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
@ActiveProfiles("test")
@Transactional
@SpringBootTest
class JWTUtilTest {

    @Autowired
    private JWTUtil jwtUtil;

    @Test
    void testGenerateAndValidateToken() {

        // ✅ Création d’un user avec rôle
        UserDetails userDetails = new User(
                "imane",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        // ✅ Génération
        String token = jwtUtil.generateToken(userDetails);
        assertNotNull(token);

        // ✅ Extraction username
        String username = jwtUtil.getUserFromToken(token);
        assertEquals("imane", username);

        // ✅ Validation
        boolean isValid = jwtUtil.validateJwtToken(token);
        assertTrue(isValid);
    }
}