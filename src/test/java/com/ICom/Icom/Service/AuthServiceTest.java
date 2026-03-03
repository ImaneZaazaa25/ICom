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

    @Test
    void testSignup_UserAlreadyExists() {
        // Préparer l'utilisateur
        User user = new User();
        user.setUsername("imane");

        // Simuler le repository : username existe déjà
        when(userRepository.existsByUsername("imane")).thenReturn(true);

        // Appel de la méthode
        String result = authService.signup(user);

        // Vérification
        assertEquals("User existe deja", result);

        // Pas de sauvegarde puisque user existe
        verify(userRepository, never()).save(any());
    }

    @Test
    void testSignup_Success() {
        User user = new User();
        user.setUsername("sihame25");
        user.setMotdepasse("sihame2511");
        user.setEmail("sihame@gmail.com");
        user.setTel("0700000000");
        user.setRole(Role.User);
        user.setStatus(Status.Active);

        // Simuler : username n'existe pas
        when(userRepository.existsByUsername("sihame25")).thenReturn(false);

        // Simuler l'encodage du mot de passe
        when(passwordEncoder.encode("sihame2511")).thenReturn("encoded");

        // Appel de la méthode
        String result = authService.signup(user);

        assertEquals("User enregistrer avec succes", result);

        // Vérifier que save a été appelé avec un User dont le mot de passe est encodé
        verify(userRepository).save(argThat(u -> u.getMotdepasse().equals("encoded")
                && u.getUsername().equals("sihame25")));
    }

    @Test
    void testSignin_Success() {
        User user = new User();
        user.setUsername("imane25");
        user.setMotdepasse("imane2511");

        // Mocker l'authentication
        Authentication authentication = mock(Authentication.class);

        UserDetails springUser =
                new org.springframework.security.core.userdetails.User(
                        "imane25",
                        "imane2511",
                        List.of(new SimpleGrantedAuthority("ROLE_Admin"))
                );

        // Simuler l'authentification réussie
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(springUser);

        // Simuler la génération du token JWT
        when(jwtUtil.generateToken("imane25")).thenReturn("admintoken123");

        // Appel de la méthode signin
        String token = authService.signin(user);

        // Vérifier le token
        assertEquals("admintoken123", token);

        // Vérifier les appels
        verify(authenticationManager).authenticate(any());
        verify(jwtUtil).generateToken("imane25");
    }

}