package com.ICom.Icom.Security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class JWTUtilTest {

    @Autowired
    private JWTUtil jwtUtil;

    @Test
    void testGenerateAndValidateToken() {

        // 1️⃣ Génération
        String token = jwtUtil.generateToken("imane");

        assertNotNull(token);

        // 2️⃣ Extraction username
        String username = jwtUtil.getUserFromToken(token);

        assertEquals("imane", username);

        // 3️⃣ Validation
        boolean isValid = jwtUtil.validateJwtToken(token);

        assertTrue(isValid);
    }
}