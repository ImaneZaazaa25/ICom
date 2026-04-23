package com.ICom.Icom.Service;

import com.ICom.Icom.DTO.AjoutPanierDTO;
import com.ICom.Icom.DTO.ModifierQuantiteDTO;
import com.ICom.Icom.DTO.PanierResponseDTO;
import com.ICom.Icom.Exception.ProduitInactifException;
import com.ICom.Icom.Exception.ResourceNotFoundException;
import com.ICom.Icom.Exception.StockInsuffisantException;
import com.ICom.Icom.Model.*;
import com.ICom.Icom.Repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

/**
 * ============================================================
 * Tests unitaires du service PanierService
 * ============================================================
 * Objectif :
 *  - Tester toute la logique métier du panier
 *  - Vérifier les cas normaux + cas limites + erreurs
 *  - Sans base de données (Mockito uniquement)
 * ============================================================
 */

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires — PanierService")
class PanierServiceTest {

    // =========================
    // MOCKS DES DEPENDANCES
    // =========================
    @Mock private PanierRepository panierRepository;
    @Mock private LignePanierRepository lignePanierRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    // Service testé
    @InjectMocks
    private PanierService panierService;

    // =========================
    // OBJETS DE TEST
    // =========================
    private User user;
    private Panier panier;
    private Product produit;
    private LignePanier lignePanier;

    @BeforeEach
    void setUp() {

        // Création d’un utilisateur fictif
        user = new User(1L, "Dupont", "Jean", "jdupont",
                "jean@test.com", "pass", Role.User, "0600000000", Status.Active);

        // Création d’un panier associé au user
        panier = new Panier();
        panier.setId(10L);
        panier.setClient(user);

        // Produit simulé (id injecté via Reflection car pas de setter)
        produit = new Product();
        ReflectionTestUtils.setField(produit, "id", 100L);
        produit.setNom("Chaussures");
        produit.setPrix(59.99);
        produit.setQuantite(10);
        produit.setStatut(true);

        // Ligne de panier existante
        lignePanier = new LignePanier();
        lignePanier.setId(1L);
        lignePanier.setPanier(panier);
        lignePanier.setProduit(produit);
        lignePanier.setQuantite(2);
        lignePanier.setPrixUnitaire(59.99);
    }

    // =========================================================
    // GET PANIER
    // =========================================================

    @Test
    @DisplayName("getPanier — panier existant → retourne DTO complet")
    void getPanier_PanierExistant_RetourneDTOAvecLignes() {

        // ARRANGE : panier déjà présent en base
        when(panierRepository.findByClientUsername("jdupont"))
                .thenReturn(Optional.of(panier));

        when(lignePanierRepository.findByPanierId(10L))
                .thenReturn(List.of(lignePanier));

        // ACT : appel service
        PanierResponseDTO result = panierService.getPanier("jdupont");

        // ASSERT : vérification résultat
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getLignes()).hasSize(1);
        assertThat(result.getTotal()).isCloseTo(59.99 * 2, within(0.001));

        // aucun insert attendu
        verify(panierRepository, never()).save(any());
    }

    @Test
    @DisplayName("getPanier — panier inexistant → création automatique")
    void getPanier_PanierInexistant_CreePanierVide() {

        Panier nouveau = new Panier();
        nouveau.setId(99L);
        nouveau.setClient(user);

        when(panierRepository.findByClientUsername("jdupont"))
                .thenReturn(Optional.empty());

        when(userRepository.findByUsername("jdupont"))
                .thenReturn(user);

        when(panierRepository.save(any(Panier.class)))
                .thenReturn(nouveau);

        when(lignePanierRepository.findByPanierId(99L))
                .thenReturn(List.of());

        // ACT
        PanierResponseDTO result = panierService.getPanier("jdupont");

        // ASSERT
        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getLignes()).isEmpty();
        assertThat(result.getTotal()).isZero();

        verify(panierRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("getPanier — user inexistant → exception")
    void getPanier_UserInexistant_LeveException() {

        when(panierRepository.findByClientUsername("ghost"))
                .thenReturn(Optional.empty());

        when(userRepository.findByUsername("ghost"))
                .thenReturn(null);

        assertThrows(ResourceNotFoundException.class,
                () -> panierService.getPanier("ghost"));

        verify(panierRepository, never()).save(any());
    }

    // =========================================================
    // AJOUT PRODUIT
    // =========================================================

    @Test
    @DisplayName("ajouterProduit — ajout normal avec stock ok")
    void ajouterProduit_NouvelleLigne() {

        when(panierRepository.findByClientUsername("jdupont"))
                .thenReturn(Optional.of(panier));

        when(productRepository.findById(100L))
                .thenReturn(Optional.of(produit));

        when(lignePanierRepository.findByPanierId(10L))
                .thenReturn(List.of())
                .thenReturn(List.of());

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(3);

        // ACT
        panierService.ajouterProduit("jdupont", dto);

        // ASSERT : vérifie création ligne panier
        verify(lignePanierRepository).save(argThat(l ->
                l.getProduit().getId().equals(100L)
                        && l.getQuantite() == 3
                        && l.getPrixUnitaire() == 59.99
        ));
    }

    @Test
    @DisplayName("ajouterProduit — produit inactif → exception")
    void ajouterProduit_ProduitInactif() {

        produit.setStatut(false);

        when(panierRepository.findByClientUsername("jdupont"))
                .thenReturn(Optional.of(panier));

        when(productRepository.findById(100L))
                .thenReturn(Optional.of(produit));

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(1);

        assertThrows(ProduitInactifException.class,
                () -> panierService.ajouterProduit("jdupont", dto));

        verify(lignePanierRepository, never()).save(any());
    }

    @Test
    @DisplayName("ajouterProduit — stock insuffisant → exception")
    void ajouterProduit_StockInsuffisant() {

        produit.setQuantite(2);

        when(panierRepository.findByClientUsername("jdupont"))
                .thenReturn(Optional.of(panier));

        when(productRepository.findById(100L))
                .thenReturn(Optional.of(produit));

        when(lignePanierRepository.findByPanierId(10L))
                .thenReturn(List.of());

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(5);

        assertThrows(StockInsuffisantException.class,
                () -> panierService.ajouterProduit("jdupont", dto));

        verify(lignePanierRepository, never()).save(any());
    }

    // =========================================================
    // MODIFIER QUANTITE
    // =========================================================

    @Test
    @DisplayName("modifierQuantite — mise à jour OK")
    void modifierQuantite_OK() {

        produit.setQuantite(20);

        when(panierRepository.findByClientUsername("jdupont"))
                .thenReturn(Optional.of(panier));

        when(lignePanierRepository.findById(1L))
                .thenReturn(Optional.of(lignePanier));

        when(lignePanierRepository.findByPanierId(10L))
                .thenReturn(List.of(lignePanier));

        ModifierQuantiteDTO dto = new ModifierQuantiteDTO();
        dto.setQuantite(7);

        PanierResponseDTO result =
                panierService.modifierQuantite("jdupont", 1L, dto);

        assertThat(lignePanier.getQuantite()).isEqualTo(7);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("modifierQuantite — ligne inexistante → exception")
    void modifierQuantite_NotFound() {

        when(panierRepository.findByClientUsername("jdupont"))
                .thenReturn(Optional.of(panier));

        when(lignePanierRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> panierService.modifierQuantite("jdupont", 999L, new ModifierQuantiteDTO()));
    }

    // =========================================================
    // SUPPRESSION
    // =========================================================

    @Test
    @DisplayName("supprimerLigne — suppression OK")
    void supprimerLigne_OK() {

        when(panierRepository.findByClientUsername("jdupont"))
                .thenReturn(Optional.of(panier));

        when(lignePanierRepository.findById(1L))
                .thenReturn(Optional.of(lignePanier));

        when(lignePanierRepository.findByPanierId(10L))
                .thenReturn(List.of());

        PanierResponseDTO result =
                panierService.supprimerLigne("jdupont", 1L);

        assertThat(result.getLignes()).isEmpty();

        verify(lignePanierRepository).delete(lignePanier);
    }
}