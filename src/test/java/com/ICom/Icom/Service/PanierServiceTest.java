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

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires — PanierService")
class PanierServiceTest {

    @Mock private PanierRepository panierRepository;
    @Mock private LignePanierRepository lignePanierRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private PanierService panierService;

    private User user;
    private Panier panier;
    private Product produit;
    private LignePanier lignePanier;

    @BeforeEach
    void setUp() {
        user = new User(1L, "Dupont", "Jean", "jdupont",
                "jean@test.com", "pass", Role.User, "0600000000", Status.Active);

        panier = new Panier();
        panier.setId(10L);
        panier.setClient(user);

        // Product n'a pas de setId() → ReflectionTestUtils
        produit = new Product();
        ReflectionTestUtils.setField(produit, "id", 100L);
        produit.setNom("Chaussures");
        produit.setPrix(59.99);
        produit.setQuantite(10);
        produit.setStatut(true);

        lignePanier = new LignePanier();
        lignePanier.setId(1L);
        lignePanier.setPanier(panier);
        lignePanier.setProduit(produit);
        lignePanier.setQuantite(2);
        lignePanier.setPrixUnitaire(59.99);
    }

    // =========================================================================
    // getPanier
    // =========================================================================

    @Test
    @DisplayName("getPanier — cas nominal : panier existant → retourne le DTO avec lignes et total")
    void getPanier_PanierExistant_RetourneDTOAvecLignes() {
        // ARRANGE
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier));

        // ACT
        PanierResponseDTO result = panierService.getPanier("jdupont");

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getLignes()).hasSize(1);
        assertThat(result.getTotal()).isCloseTo(59.99 * 2, within(0.001));
        verify(panierRepository, never()).save(any()); // aucune création
    }

    @Test
    @DisplayName("getPanier — création : panier inexistant → nouveau panier créé et retourné vide")
    void getPanier_PanierInexistant_CreePanierVide() {
        // ARRANGE
        Panier nouveauPanier = new Panier();
        nouveauPanier.setId(99L);
        nouveauPanier.setClient(user);

        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(panierRepository.save(any(Panier.class))).thenReturn(nouveauPanier);
        when(lignePanierRepository.findByPanierId(99L)).thenReturn(List.of());

        // ACT
        PanierResponseDTO result = panierService.getPanier("jdupont");

        // ASSERT
        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getLignes()).isEmpty();
        assertThat(result.getTotal()).isZero();
        verify(panierRepository, times(1)).save(any(Panier.class));
    }

    @Test
    @DisplayName("getPanier — erreur : panier inexistant + utilisateur introuvable → ResourceNotFoundException")
    void getPanier_UserInexistant_LeveResourceNotFoundException() {
        // ARRANGE
        when(panierRepository.findByClientUsername("ghost")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("ghost")).thenReturn(null);

        // ACT + ASSERT
        assertThrows(ResourceNotFoundException.class,
                () -> panierService.getPanier("ghost"));
        verify(panierRepository, never()).save(any());
    }

    // =========================================================================
    // ajouterProduit
    // =========================================================================

    @Test
    @DisplayName("ajouterProduit — cas nominal : nouvelle ligne, stock ok → ligne créée avec snapshot de prix")
    void ajouterProduit_NouvelleLingeStockOk_LigneCreeeAvecSnapshotPrix() {
        // ARRANGE
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(productRepository.findById(100L)).thenReturn(Optional.of(produit));
        // 1er appel : check ligne existante (vide) | 2e appel : buildDTO
        when(lignePanierRepository.findByPanierId(10L))
                .thenReturn(List.of())
                .thenReturn(List.of());

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(3);

        // ACT
        panierService.ajouterProduit("jdupont", dto);

        // ASSERT
        verify(lignePanierRepository, times(1)).save(argThat(l ->
                l.getProduit().getId().equals(100L)
                && l.getQuantite() == 3
                && l.getPrixUnitaire() == 59.99
        ));
    }

    @Test
    @DisplayName("ajouterProduit — cas limite : quantité demandée = stock exact → succès sans exception")
    void ajouterProduit_QuantiteEgaleAuStock_Succes() {
        // ARRANGE
        produit.setQuantite(5); // stock = 5
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(productRepository.findById(100L)).thenReturn(Optional.of(produit));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of());

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(5); // exactement le stock

        // ACT + ASSERT
        assertDoesNotThrow(() -> panierService.ajouterProduit("jdupont", dto));
        verify(lignePanierRepository, times(1)).save(any(LignePanier.class));
    }

    @Test
    @DisplayName("ajouterProduit — cumul : produit déjà dans panier, stock ok → quantité cumulée mise à jour")
    void ajouterProduit_ProduitDejaPresent_CumulQuantite() {
        // ARRANGE
        lignePanier.setQuantite(2); // déjà 2 unités dans le panier
        produit.setQuantite(10);    // stock = 10

        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(productRepository.findById(100L)).thenReturn(Optional.of(produit));
        // 1er appel : ligne existante | 2e appel : buildDTO
        when(lignePanierRepository.findByPanierId(10L))
                .thenReturn(List.of(lignePanier))
                .thenReturn(List.of(lignePanier));

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(3); // 2 + 3 = 5

        // ACT
        panierService.ajouterProduit("jdupont", dto);

        // ASSERT
        assertThat(lignePanier.getQuantite()).isEqualTo(5);
        verify(lignePanierRepository, times(1)).save(lignePanier);
    }

    @Test
    @DisplayName("ajouterProduit — cas limite cumul : total cumulé = stock exact → succès")
    void ajouterProduit_CumulEgalAuStock_Succes() {
        // ARRANGE
        lignePanier.setQuantite(3); // déjà 3 dans le panier
        produit.setQuantite(5);     // stock = 5

        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(productRepository.findById(100L)).thenReturn(Optional.of(produit));
        when(lignePanierRepository.findByPanierId(10L))
                .thenReturn(List.of(lignePanier))
                .thenReturn(List.of(lignePanier));

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(2); // 3 + 2 = 5 = stock

        // ACT + ASSERT
        assertDoesNotThrow(() -> panierService.ajouterProduit("jdupont", dto));
        assertThat(lignePanier.getQuantite()).isEqualTo(5);
    }

    @Test
    @DisplayName("ajouterProduit — erreur : produit inactif → ProduitInactifException, save jamais appelé")
    void ajouterProduit_ProduitInactif_LeveProduitInactifException() {
        // ARRANGE
        produit.setStatut(false);
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(productRepository.findById(100L)).thenReturn(Optional.of(produit));

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(1);

        // ACT + ASSERT
        ProduitInactifException ex = assertThrows(
                ProduitInactifException.class,
                () -> panierService.ajouterProduit("jdupont", dto)
        );
        assertThat(ex.getMessage()).contains("Chaussures");
        verify(lignePanierRepository, never()).save(any());
    }

    @Test
    @DisplayName("ajouterProduit — erreur : stock insuffisant (nouvelle ligne) → StockInsuffisantException")
    void ajouterProduit_StockInsuffisant_NouveauProduit_LeveException() {
        // ARRANGE
        produit.setQuantite(2); // stock = 2
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(productRepository.findById(100L)).thenReturn(Optional.of(produit));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of());

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(5); // 5 > stock 2

        // ACT + ASSERT
        StockInsuffisantException ex = assertThrows(
                StockInsuffisantException.class,
                () -> panierService.ajouterProduit("jdupont", dto)
        );
        assertThat(ex.getMessage()).contains("Chaussures");
        assertThat(ex.getMessage()).contains("2");  // disponible
        verify(lignePanierRepository, never()).save(any());
    }

    @Test
    @DisplayName("ajouterProduit — erreur : stock insuffisant (cumul) → StockInsuffisantException")
    void ajouterProduit_StockInsuffisant_Cumul_LeveException() {
        // ARRANGE
        lignePanier.setQuantite(8); // déjà 8 dans le panier
        produit.setQuantite(10);    // stock = 10

        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(productRepository.findById(100L)).thenReturn(Optional.of(produit));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier));

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(100L);
        dto.setQuantite(5); // 8 + 5 = 13 > stock 10

        // ACT + ASSERT
        StockInsuffisantException ex = assertThrows(
                StockInsuffisantException.class,
                () -> panierService.ajouterProduit("jdupont", dto)
        );
        assertThat(ex.getMessage()).contains("13"); // total demandé
        verify(lignePanierRepository, never()).save(any());
    }

    @Test
    @DisplayName("ajouterProduit — erreur : produit introuvable → ResourceNotFoundException")
    void ajouterProduit_ProduitInexistant_LeveResourceNotFoundException() {
        // ARRANGE
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        AjoutPanierDTO dto = new AjoutPanierDTO();
        dto.setProduitId(999L);
        dto.setQuantite(1);

        // ACT + ASSERT
        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> panierService.ajouterProduit("jdupont", dto)
        );
        assertThat(ex.getMessage()).contains("999");
        verify(lignePanierRepository, never()).save(any());
    }

    // =========================================================================
    // modifierQuantite
    // =========================================================================

    @Test
    @DisplayName("modifierQuantite — cas nominal : quantité valide → ligne mise à jour en BDD")
    void modifierQuantite_CasNominal_QuantiteMisAJour() {
        // ARRANGE
        produit.setQuantite(20); // stock suffisant
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findById(1L)).thenReturn(Optional.of(lignePanier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier));

        ModifierQuantiteDTO dto = new ModifierQuantiteDTO();
        dto.setQuantite(7);

        // ACT
        PanierResponseDTO result = panierService.modifierQuantite("jdupont", 1L, dto);

        // ASSERT
        assertThat(lignePanier.getQuantite()).isEqualTo(7);
        verify(lignePanierRepository, times(1)).save(lignePanier);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("modifierQuantite — cas limite : quantité = stock exact → succès sans exception")
    void modifierQuantite_QuantiteEgaleAuStock_Succes() {
        // ARRANGE
        produit.setQuantite(7); // stock = 7
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findById(1L)).thenReturn(Optional.of(lignePanier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier));

        ModifierQuantiteDTO dto = new ModifierQuantiteDTO();
        dto.setQuantite(7); // exactement le stock

        // ACT + ASSERT
        assertDoesNotThrow(() -> panierService.modifierQuantite("jdupont", 1L, dto));
        assertThat(lignePanier.getQuantite()).isEqualTo(7);
    }

    @Test
    @DisplayName("modifierQuantite — erreur : ligne introuvable → ResourceNotFoundException")
    void modifierQuantite_LigneInexistante_LeveResourceNotFoundException() {
        // ARRANGE
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findById(999L)).thenReturn(Optional.empty());

        // ACT + ASSERT
        assertThrows(ResourceNotFoundException.class,
                () -> panierService.modifierQuantite("jdupont", 999L, new ModifierQuantiteDTO()));
        verify(lignePanierRepository, never()).save(any());
    }

    @Test
    @DisplayName("modifierQuantite — erreur : ligne appartient à un autre panier → AccessDeniedException")
    void modifierQuantite_LigneAutrePanier_LeveAccessDeniedException() {
        // ARRANGE
        Panier autrePanier = new Panier();
        autrePanier.setId(999L); // panier ≠ celui du user connecté
        lignePanier.setPanier(autrePanier);

        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier)); // id=10
        when(lignePanierRepository.findById(1L)).thenReturn(Optional.of(lignePanier));         // → panier id=999

        // ACT + ASSERT
        assertThrows(AccessDeniedException.class,
                () -> panierService.modifierQuantite("jdupont", 1L, new ModifierQuantiteDTO()));
        verify(lignePanierRepository, never()).save(any());
    }

    @Test
    @DisplayName("modifierQuantite — erreur : stock insuffisant → StockInsuffisantException")
    void modifierQuantite_StockInsuffisant_LeveStockInsuffisantException() {
        // ARRANGE
        produit.setQuantite(3); // stock = 3
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findById(1L)).thenReturn(Optional.of(lignePanier));

        ModifierQuantiteDTO dto = new ModifierQuantiteDTO();
        dto.setQuantite(10); // 10 > stock 3

        // ACT + ASSERT
        StockInsuffisantException ex = assertThrows(
                StockInsuffisantException.class,
                () -> panierService.modifierQuantite("jdupont", 1L, dto)
        );
        assertThat(ex.getMessage()).contains("Chaussures");
        assertThat(ex.getMessage()).contains("3"); // stock disponible affiché
        verify(lignePanierRepository, never()).save(any());
    }

    // =========================================================================
    // supprimerLigne
    // =========================================================================

    @Test
    @DisplayName("supprimerLigne — cas nominal : ligne appartenant au user → ligne supprimée, panier vide retourné")
    void supprimerLigne_CasNominal_LigneSupprimee() {
        // ARRANGE
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findById(1L)).thenReturn(Optional.of(lignePanier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of()); // buildDTO après suppression

        // ACT
        PanierResponseDTO result = panierService.supprimerLigne("jdupont", 1L);

        // ASSERT
        assertThat(result.getLignes()).isEmpty();
        assertThat(result.getTotal()).isZero();
        verify(lignePanierRepository, times(1)).delete(lignePanier);
    }

    @Test
    @DisplayName("supprimerLigne — erreur : ligne introuvable → ResourceNotFoundException, delete jamais appelé")
    void supprimerLigne_LigneInexistante_LeveResourceNotFoundException() {
        // ARRANGE
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findById(999L)).thenReturn(Optional.empty());

        // ACT + ASSERT
        assertThrows(ResourceNotFoundException.class,
                () -> panierService.supprimerLigne("jdupont", 999L));
        verify(lignePanierRepository, never()).delete(any());
    }

    @Test
    @DisplayName("supprimerLigne — erreur : ligne appartient à un autre panier → AccessDeniedException")
    void supprimerLigne_LigneAutrePanier_LeveAccessDeniedException() {
        // ARRANGE
        Panier autrePanier = new Panier();
        autrePanier.setId(888L);
        lignePanier.setPanier(autrePanier);

        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier)); // id=10
        when(lignePanierRepository.findById(1L)).thenReturn(Optional.of(lignePanier));         // → panier id=888

        // ACT + ASSERT
        assertThrows(AccessDeniedException.class,
                () -> panierService.supprimerLigne("jdupont", 1L));
        verify(lignePanierRepository, never()).delete(any());
    }
}
