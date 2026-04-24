package com.ICom.Icom.Service;

import com.ICom.Icom.DTO.UpdateProfileDTO;
import com.ICom.Icom.DTO.UserProfileDTO;
import com.ICom.Icom.Exception.ResourceNotFoundException;
import com.ICom.Icom.Model.Role;
import com.ICom.Icom.Model.Status;
import com.ICom.Icom.Model.User;
import com.ICom.Icom.Repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires du UserService.
 *
 * Objectif :
 * - Vérifier la récupération du profil utilisateur
 * - Vérifier la mise à jour du profil (complète et partielle)
 * - Vérifier les cas d’erreur (utilisateur inexistant)
 * - Vérifier l’encodage du mot de passe
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires — UserService")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;

    /**
     * Initialisation d’un utilisateur fictif utilisé dans les tests.
     */
    @BeforeEach
    void setUp() {
        user = new User(
                1L,
                "Dupont",
                "Jean",
                "jdupont",
                "jean@test.com",
                "motdepasse_encode",
                Role.User,
                "0600000000",
                Status.Active
        );
    }

    // =========================================================================
    // GET PROFIL
    // =========================================================================

    /**
     * Cas nominal : récupération correcte du profil utilisateur.
     */
    @Test
    @DisplayName("getProfil — cas nominal : retourne le DTO complet du user trouvé")
    void getProfil_UserExistant_RetourneDTO() {

        // Mock : utilisateur trouvé en base
        when(userRepository.findByUsername("jdupont")).thenReturn(user);

        // Appel service
        UserProfileDTO result = userService.getProfil("jdupont");

        // Vérifications des données retournées
        assertThat(result).isNotNull();
        assertThat(result.getIdUser()).isEqualTo(1L);
        assertThat(result.getNom()).isEqualTo("Dupont");
        assertThat(result.getPrenom()).isEqualTo("Jean");
        assertThat(result.getUsername()).isEqualTo("jdupont");
        assertThat(result.getEmail()).isEqualTo("jean@test.com");
        assertThat(result.getTel()).isEqualTo("0600000000");
        assertThat(result.getRole()).isEqualTo(Role.User);
        assertThat(result.getStatus()).isEqualTo(Status.Active);

        verify(userRepository, times(1)).findByUsername("jdupont");
    }

    /**
     * Cas erreur : utilisateur inexistant → exception levée.
     */
    @Test
    @DisplayName("getProfil — erreur : utilisateur inexistant → ResourceNotFoundException")
    void getProfil_UserInexistant_LeveResourceNotFoundException() {

        when(userRepository.findByUsername("inconnu")).thenReturn(null);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> userService.getProfil("inconnu")
        );

        assertThat(ex.getMessage()).contains("inconnu");
        verify(userRepository, times(1)).findByUsername("inconnu");
    }

    // =========================================================================
    // UPDATE PROFIL
    // =========================================================================

    /**
     * Cas nominal : mise à jour complète du profil utilisateur.
     */
    @Test
    @DisplayName("updateProfil — cas nominal : tous les champs fournis sont mis à jour")
    void updateProfil_TousLesChampsFournis_TousMisAJour() {

        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(passwordEncoder.encode("nouveauSecret")).thenReturn("hash_nouveau");
        when(userRepository.save(user)).thenReturn(user);

        UpdateProfileDTO dto = new UpdateProfileDTO();
        dto.setNom("Martin");
        dto.setPrenom("Pierre");
        dto.setEmail("pierre@test.com");
        dto.setTel("0700000000");
        dto.setMotdepasse("nouveauSecret");

        UserProfileDTO result = userService.updateProfil("jdupont", dto);

        assertThat(result.getNom()).isEqualTo("Martin");
        assertThat(result.getPrenom()).isEqualTo("Pierre");
        assertThat(result.getEmail()).isEqualTo("pierre@test.com");
        assertThat(result.getTel()).isEqualTo("0700000000");

        // Vérifie encodage mot de passe
        assertThat(user.getMotdepasse()).isEqualTo("hash_nouveau");

        verify(passwordEncoder, times(1)).encode("nouveauSecret");
        verify(userRepository, times(1)).save(user);
    }

    /**
     * Mise à jour partielle : seul un champ est modifié.
     */
    @Test
    @DisplayName("updateProfil — mise à jour partielle : seul le nom est modifié")
    void updateProfil_NomSeulFourni_SeulNomMisAJour() {

        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(userRepository.save(user)).thenReturn(user);

        UpdateProfileDTO dto = new UpdateProfileDTO();
        dto.setNom("Nouveau");

        UserProfileDTO result = userService.updateProfil("jdupont", dto);

        assertThat(result.getNom()).isEqualTo("Nouveau");
        assertThat(result.getPrenom()).isEqualTo("Jean");
        assertThat(result.getEmail()).isEqualTo("jean@test.com");

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, times(1)).save(user);
    }

    /**
     * Cas limite : champs vides → aucune modification.
     */
    @Test
    @DisplayName("updateProfil — champs vides : aucune modification appliquée")
    void updateProfil_ChampsBlancs_AucuneModification() {

        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(userRepository.save(user)).thenReturn(user);

        UpdateProfileDTO dto = new UpdateProfileDTO();
        dto.setNom("   ");
        dto.setPrenom("");
        dto.setEmail("  ");
        dto.setTel("  ");
        dto.setMotdepasse("  ");

        UserProfileDTO result = userService.updateProfil("jdupont", dto);

        assertThat(result.getNom()).isEqualTo("Dupont");
        assertThat(result.getPrenom()).isEqualTo("Jean");

        verify(passwordEncoder, never()).encode(any());
    }

    /**
     * Erreur : utilisateur inexistant → aucune sauvegarde.
     */
    @Test
    @DisplayName("updateProfil — utilisateur inexistant → exception sans save")
    void updateProfil_UserInexistant_LeveExceptionSansSave() {

        when(userRepository.findByUsername("fantome")).thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.updateProfil("fantome", new UpdateProfileDTO())
        );

        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    /**
     * Cas limite : seul le mot de passe est modifié.
     */
    @Test
    @DisplayName("updateProfil — seul mot de passe modifié")
    void updateProfil_MotDePasseSeul_PasswordEncodeEtAutresIntacts() {

        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(passwordEncoder.encode("monMotDePasse")).thenReturn("hash_encode");
        when(userRepository.save(user)).thenReturn(user);

        UpdateProfileDTO dto = new UpdateProfileDTO();
        dto.setMotdepasse("monMotDePasse");

        userService.updateProfil("jdupont", dto);

        assertThat(user.getMotdepasse()).isEqualTo("hash_encode");
        assertThat(user.getNom()).isEqualTo("Dupont");

        verify(passwordEncoder, times(1)).encode("monMotDePasse");
    }
}