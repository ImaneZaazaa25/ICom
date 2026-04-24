package com.ICom.Icom.Service;

import com.ICom.Icom.Model.Role;
import com.ICom.Icom.Model.Status;
import com.ICom.Icom.Model.User;
import com.ICom.Icom.Repositories.UserRepository;
import com.ICom.Icom.Security.JWTUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires du AuthService
 *
 * Objectif :
 * - Tester signup (cas succès + utilisateur existant)
 * - Tester signin (auth + génération JWT)
 * - Isoler complètement les dépendances avec Mockito
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    AuthenticationManager authenticationManager;

    @Mock
    UserRepository userRepository;

    @Mock
    JWTUtil jwtUtil;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    AuthService authService;

    // ======================================================
    // TEST 1 : Signup utilisateur déjà existant
    // ======================================================

    /**
     * Vérifie que :
     * - si le username existe déjà
     * - le service retourne un message d’erreur
     * - aucun save en base n’est effectué
     */
    @Test
    void testSignup_UserAlreadyExists() {

        // Création utilisateur de test
        User user = new User();
        user.setUsername("imane");

        // Simulation : utilisateur déjà présent en BDD
        when(userRepository.existsByUsername("imane")).thenReturn(true);

        // Appel méthode signup
        String result = authService.signup(user);

        // Vérification message retour
        assertEquals("User existe deja", result);

        // Vérifie qu'aucun enregistrement n'a été fait
        verify(userRepository, never()).save(any());
    }

    // ======================================================
    // TEST 2 : Signup réussi
    // ======================================================

    /**
     * Vérifie que :
     * - un nouvel utilisateur est bien créé
     * - le mot de passe est encodé
     * - le user est sauvegardé en base
     */
    @Test
    void testSignup_Success() {

        // Données utilisateur
        User user = new User();
        user.setUsername("sihame25");
        user.setMotdepasse("sihame2511");
        user.setEmail("sihame@gmail.com");
        user.setTel("0700000000");
        user.setRole(Role.User);
        user.setStatus(Status.Active);

        // Simulation : utilisateur n'existe pas encore
        when(userRepository.existsByUsername("sihame25")).thenReturn(false);

        // Simulation encodage password
        when(passwordEncoder.encode("sihame2511")).thenReturn("encoded");

        // Appel méthode signup
        String result = authService.signup(user);

        // Vérification message retour
        assertEquals("User enregistrer avec succes", result);

        // Vérifie que le user sauvegardé contient le password encodé
        verify(userRepository).save(argThat(u ->
                u.getMotdepasse().equals("encoded") &&
                        u.getUsername().equals("sihame25")
        ));
    }

    // ======================================================
    // TEST 3 : Signin réussi + génération token JWT
    // ======================================================

    /**
     * Vérifie que :
     * - authenticationManager valide les credentials
     * - JWT est généré correctement
     * - token retourné est correct
     */
    @Test
    void testSignin_Success() {

        // Données login
        User user = new User();
        user.setUsername("imane25");
        user.setMotdepasse("imane2511");

        // Mock authentication Spring Security
        Authentication authentication = mock(Authentication.class);

        // Simulation UserDetails retourné après auth
        UserDetails springUser =
                new org.springframework.security.core.userdetails.User(
                        "imane25",
                        "imane2511",
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                );

        // Simulation authentication réussie
        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(springUser);

        // Simulation génération JWT
        when(jwtUtil.generateToken(springUser))
                .thenReturn("admintoken123");

        // Appel signin
        String token = authService.signin(user);

        // Vérification token retourné
        assertEquals("admintoken123", token);

        // Vérifie interactions
        verify(authenticationManager).authenticate(any());
        verify(jwtUtil).generateToken(springUser);
    }
}