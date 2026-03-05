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

    @BeforeEach
    void setUp() {
        // Utilise @AllArgsConstructor : (idUser, nom, prenom, username, email, motdepasse, role, tel, status)
        user = new User(1L, "Dupont", "Jean", "jdupont",
                "jean@test.com", "motdepasse_encode",
                Role.User, "0600000000", Status.Active);
    }

    // =========================================================================
    // getProfil
    // =========================================================================

    @Test
    @DisplayName("getProfil — cas nominal : retourne le DTO complet du user trouvé")
    void getProfil_UserExistant_RetourneDTO() {
        // ARRANGE
        when(userRepository.findByUsername("jdupont")).thenReturn(user);

        // ACT
        UserProfileDTO result = userService.getProfil("jdupont");

        // ASSERT
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

    @Test
    @DisplayName("getProfil — erreur : utilisateur inexistant → ResourceNotFoundException")
    void getProfil_UserInexistant_LeveResourceNotFoundException() {
        // ARRANGE
        when(userRepository.findByUsername("inconnu")).thenReturn(null);

        // ACT + ASSERT
        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> userService.getProfil("inconnu")
        );
        assertThat(ex.getMessage()).contains("inconnu");
        verify(userRepository, times(1)).findByUsername("inconnu");
    }

    // =========================================================================
    // updateProfil
    // =========================================================================

    @Test
    @DisplayName("updateProfil — cas nominal : tous les champs fournis sont mis à jour")
    void updateProfil_TousLesChampsFournis_TousMisAJour() {
        // ARRANGE
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(passwordEncoder.encode("nouveauSecret")).thenReturn("hash_nouveau");
        when(userRepository.save(user)).thenReturn(user);

        UpdateProfileDTO dto = new UpdateProfileDTO();
        dto.setNom("Martin");
        dto.setPrenom("Pierre");
        dto.setEmail("pierre@test.com");
        dto.setTel("0700000000");
        dto.setMotdepasse("nouveauSecret");

        // ACT
        UserProfileDTO result = userService.updateProfil("jdupont", dto);

        // ASSERT
        assertThat(result.getNom()).isEqualTo("Martin");
        assertThat(result.getPrenom()).isEqualTo("Pierre");
        assertThat(result.getEmail()).isEqualTo("pierre@test.com");
        assertThat(result.getTel()).isEqualTo("0700000000");
        // Vérifier que le mot de passe a bien été encodé et appliqué
        assertThat(user.getMotdepasse()).isEqualTo("hash_nouveau");
        verify(passwordEncoder, times(1)).encode("nouveauSecret");
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("updateProfil — mise à jour partielle : seul le nom fourni → seul le nom modifié")
    void updateProfil_NomSeulFourni_SeulNomMisAJour() {
        // ARRANGE
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(userRepository.save(user)).thenReturn(user);

        UpdateProfileDTO dto = new UpdateProfileDTO();
        dto.setNom("Nouveau"); // les autres champs restent null

        // ACT
        UserProfileDTO result = userService.updateProfil("jdupont", dto);

        // ASSERT
        assertThat(result.getNom()).isEqualTo("Nouveau");
        assertThat(result.getPrenom()).isEqualTo("Jean");          // inchangé
        assertThat(result.getEmail()).isEqualTo("jean@test.com");  // inchangé
        assertThat(result.getTel()).isEqualTo("0600000000");       // inchangé
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("updateProfil — cas limite : champs blancs fournis → aucune modification appliquée")
    void updateProfil_ChampsBlancs_AucuneModification() {
        // ARRANGE
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(userRepository.save(user)).thenReturn(user);

        UpdateProfileDTO dto = new UpdateProfileDTO();
        dto.setNom("   ");    // blank
        dto.setPrenom("");    // vide
        dto.setEmail("  ");   // blank
        dto.setTel("  ");     // blank
        dto.setMotdepasse("  "); // blank

        // ACT
        UserProfileDTO result = userService.updateProfil("jdupont", dto);

        // ASSERT — aucun champ ne doit avoir changé
        assertThat(result.getNom()).isEqualTo("Dupont");
        assertThat(result.getPrenom()).isEqualTo("Jean");
        assertThat(result.getEmail()).isEqualTo("jean@test.com");
        assertThat(result.getTel()).isEqualTo("0600000000");
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("updateProfil — erreur : utilisateur inexistant → ResourceNotFoundException, save jamais appelé")
    void updateProfil_UserInexistant_LeveExceptionSansSave() {
        // ARRANGE
        when(userRepository.findByUsername("fantome")).thenReturn(null);

        // ACT + ASSERT
        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> userService.updateProfil("fantome", new UpdateProfileDTO())
        );
        assertThat(ex.getMessage()).contains("fantome");
        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("updateProfil — cas limite : seul le mot de passe fourni → encodage effectué, autres champs intacts")
    void updateProfil_MotDePasseSeul_PasswordEncodeEtAutresIntacts() {
        // ARRANGE
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(passwordEncoder.encode("monMotDePasse")).thenReturn("hash_encode");
        when(userRepository.save(user)).thenReturn(user);

        UpdateProfileDTO dto = new UpdateProfileDTO();
        dto.setMotdepasse("monMotDePasse");

        // ACT
        userService.updateProfil("jdupont", dto);

        // ASSERT
        assertThat(user.getMotdepasse()).isEqualTo("hash_encode");
        assertThat(user.getNom()).isEqualTo("Dupont");      // inchangé
        assertThat(user.getPrenom()).isEqualTo("Jean");     // inchangé
        verify(passwordEncoder, times(1)).encode("monMotDePasse");
    }
}
