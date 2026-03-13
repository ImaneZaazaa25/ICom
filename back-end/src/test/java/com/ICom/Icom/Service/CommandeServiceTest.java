package com.ICom.Icom.Service;

import com.ICom.Icom.DTO.CommandeResponseDTO;
import com.ICom.Icom.Exception.ProduitInactifException;
import com.ICom.Icom.Exception.ResourceNotFoundException;
import com.ICom.Icom.Exception.StockInsuffisantException;
import com.ICom.Icom.Model.*;
import com.ICom.Icom.Repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires — CommandeService")
class CommandeServiceTest {

    @Mock private CommandeRepository commandeRepository;
    @Mock private LigneCommandeRepository ligneCommandeRepository;
    @Mock private PanierRepository panierRepository;
    @Mock private LignePanierRepository lignePanierRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private CommandeService commandeService;

    private User user;
    private Panier panier;
    private Product produit;
    private LignePanier lignePanier;
    private Commande commande;
    private LigneCommande ligneCommande;

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

        // Commande de référence utilisée pour getMesCommandes
        commande = new Commande();
        commande.setId(50L);
        commande.setClient(user);
        commande.setDateCommande(new Date());
        commande.setEtat(EtatCommande.VALIDEE);
        commande.setTotal(119.98);

        ligneCommande = new LigneCommande();
        ligneCommande.setId(200L);
        ligneCommande.setCommande(commande);
        ligneCommande.setProduit(produit);
        ligneCommande.setQuantite(2);
        ligneCommande.setPrixUnitaire(59.99);
    }

    // =========================================================================
    // validerPanier
    // =========================================================================

    @Test
    @DisplayName("validerPanier — cas nominal : commande créée, stock décrémenté, panier vidé")
    void validerPanier_CasNominal_CommandeCreeeStockDecrementeEtPanierVide() {
        // ARRANGE
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier));
        when(commandeRepository.save(any(Commande.class))).thenReturn(commande);
        // buildDTO appelle findByCommandeId — l'id de la commande est null dans le service
        // car le retour de save n'est pas capturé (comportement actuel du service)
        when(ligneCommandeRepository.findByCommandeId(any())).thenReturn(List.of(ligneCommande));

        // ACT
        CommandeResponseDTO result = commandeService.validerPanier("jdupont");

        // ASSERT
        assertThat(result).isNotNull();
        assertThat(result.getEtat()).isEqualTo(EtatCommande.VALIDEE);

        // Stock décrémenté : 10 - 2 = 8
        assertThat(produit.getQuantite()).isEqualTo(8);

        // Ligne commande créée
        verify(ligneCommandeRepository, times(1)).save(any(LigneCommande.class));
        // Produit sauvegardé avec le nouveau stock
        verify(productRepository, times(1)).save(produit);
        // Panier vidé
        verify(lignePanierRepository, times(1)).deleteAll(List.of(lignePanier));
        // Commande sauvegardée 2 fois : création initiale + mise à jour du total
        verify(commandeRepository, times(2)).save(any(Commande.class));
    }

    @Test
    @DisplayName("validerPanier — vérification du total : deux lignes → total = somme des sous-totaux")
    void validerPanier_DeuxLignes_TotalCalculeCorrectement() {
        // ARRANGE
        Product produit2 = new Product();
        ReflectionTestUtils.setField(produit2, "id", 200L);
        produit2.setNom("T-shirt");
        produit2.setPrix(19.99);
        produit2.setQuantite(5);
        produit2.setStatut(true);

        LignePanier lp2 = new LignePanier();
        lp2.setId(2L);
        lp2.setPanier(panier);
        lp2.setProduit(produit2);
        lp2.setQuantite(1);
        lp2.setPrixUnitaire(19.99);

        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier, lp2));
        // Retourne l'argument tel quel pour pouvoir inspecter le total après le 2e save
        when(commandeRepository.save(any(Commande.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(ligneCommandeRepository.findByCommandeId(any())).thenReturn(List.of());

        // ACT
        commandeService.validerPanier("jdupont");

        // ASSERT
        ArgumentCaptor<Commande> captor = ArgumentCaptor.forClass(Commande.class);
        verify(commandeRepository, times(2)).save(captor.capture());
        // La 2ème sauvegarde contient le total calculé : 2*59.99 + 1*19.99 = 139.97
        double totalAttendu = 2 * 59.99 + 1 * 19.99;
        assertThat(captor.getAllValues().get(1).getTotal())
                .isCloseTo(totalAttendu, within(0.001));

        // Deux lignes commande créées, deux produits mis à jour
        verify(ligneCommandeRepository, times(2)).save(any(LigneCommande.class));
        verify(productRepository, times(2)).save(any(Product.class));
    }

    @Test
    @DisplayName("validerPanier — cas limite : quantité panier = stock exact → succès, stock tombe à 0")
    void validerPanier_QuantiteEgaleAuStock_SuccesStockAZero() {
        // ARRANGE
        produit.setQuantite(2); // stock = quantité dans le panier (2)
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier));
        when(commandeRepository.save(any(Commande.class))).thenReturn(commande);
        when(ligneCommandeRepository.findByCommandeId(any())).thenReturn(List.of(ligneCommande));

        // ACT
        assertDoesNotThrow(() -> commandeService.validerPanier("jdupont"));

        // ASSERT
        assertThat(produit.getQuantite()).isZero();
    }

    @Test
    @DisplayName("validerPanier — erreur : utilisateur inexistant → ResourceNotFoundException, rien créé")
    void validerPanier_UserInexistant_LeveResourceNotFoundException() {
        // ARRANGE
        when(userRepository.findByUsername("fantome")).thenReturn(null);

        // ACT + ASSERT
        assertThrows(ResourceNotFoundException.class,
                () -> commandeService.validerPanier("fantome"));
        verify(commandeRepository, never()).save(any());
        verify(lignePanierRepository, never()).deleteAll(any());
    }

    @Test
    @DisplayName("validerPanier — erreur : aucun panier trouvé → RuntimeException avec message explicite")
    void validerPanier_AucunPanier_LeveRuntimeException() {
        // ARRANGE
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.empty());

        // ACT + ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> commandeService.validerPanier("jdupont"));
        assertThat(ex.getMessage()).contains("Aucun panier");
        verify(commandeRepository, never()).save(any());
    }

    @Test
    @DisplayName("validerPanier — cas limite : panier vide (aucune ligne) → RuntimeException avec message explicite")
    void validerPanier_PanierVide_LeveRuntimeException() {
        // ARRANGE
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of()); // panier vide

        // ACT + ASSERT
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> commandeService.validerPanier("jdupont"));
        assertThat(ex.getMessage()).contains("vide");
        verify(commandeRepository, never()).save(any());
        verify(lignePanierRepository, never()).deleteAll(any());
    }

    @Test
    @DisplayName("validerPanier — erreur : produit inactif dans panier → ProduitInactifException, annulation totale")
    void validerPanier_ProduitInactif_LeveProduitInactifException() {
        // ARRANGE
        produit.setStatut(false); // produit désactivé
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier));

        // ACT + ASSERT
        ProduitInactifException ex = assertThrows(
                ProduitInactifException.class,
                () -> commandeService.validerPanier("jdupont")
        );
        assertThat(ex.getMessage()).contains("Chaussures");
        // Aucune modification ne doit avoir eu lieu (Phase 1 = vérification globale)
        verify(commandeRepository, never()).save(any());
        verify(ligneCommandeRepository, never()).save(any());
        verify(productRepository, never()).save(any());
        verify(lignePanierRepository, never()).deleteAll(any());
    }

    @Test
    @DisplayName("validerPanier — erreur : stock insuffisant → StockInsuffisantException, annulation totale")
    void validerPanier_StockInsuffisant_LeveStockInsuffisantException() {
        // ARRANGE
        produit.setQuantite(1); // stock = 1, panier contient 2 unités
        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier));

        // ACT + ASSERT
        StockInsuffisantException ex = assertThrows(
                StockInsuffisantException.class,
                () -> commandeService.validerPanier("jdupont")
        );
        assertThat(ex.getMessage()).contains("Chaussures");
        assertThat(ex.getMessage()).contains("1");  // disponible
        assertThat(ex.getMessage()).contains("2");  // demandé
        // Aucune modification : Phase 1 bloque tout avant Phase 2
        verify(commandeRepository, never()).save(any());
        verify(productRepository, never()).save(any());
        verify(lignePanierRepository, never()).deleteAll(any());
    }

    @Test
    @DisplayName("validerPanier — erreur : premier produit ok, second inactif → ProduitInactifException, rien persisté")
    void validerPanier_PremierProduitOkSecondInactif_AnnulationTotale() {
        // ARRANGE
        Product produitInactif = new Product();
        ReflectionTestUtils.setField(produitInactif, "id", 200L);
        produitInactif.setNom("Veste");
        produitInactif.setQuantite(5);
        produitInactif.setStatut(false); // inactif

        LignePanier lp2 = new LignePanier();
        lp2.setId(2L);
        lp2.setPanier(panier);
        lp2.setProduit(produitInactif);
        lp2.setQuantite(1);
        lp2.setPrixUnitaire(89.99);

        when(userRepository.findByUsername("jdupont")).thenReturn(user);
        when(panierRepository.findByClientUsername("jdupont")).thenReturn(Optional.of(panier));
        // produit (actif) en premier, produitInactif en second
        when(lignePanierRepository.findByPanierId(10L)).thenReturn(List.of(lignePanier, lp2));

        // ACT + ASSERT
        assertThrows(ProduitInactifException.class,
                () -> commandeService.validerPanier("jdupont"));
        verify(commandeRepository, never()).save(any());
        verify(lignePanierRepository, never()).deleteAll(any());
    }

    // =========================================================================
    // getMesCommandes
    // =========================================================================

    @Test
    @DisplayName("getMesCommandes — cas nominal : retourne la liste des commandes avec leurs lignes")
    void getMesCommandes_CasNominal_RetourneListeCommandesAvecLignes() {
        // ARRANGE
        when(commandeRepository.findByClientUsername("jdupont")).thenReturn(List.of(commande));
        when(ligneCommandeRepository.findByCommandeId(50L)).thenReturn(List.of(ligneCommande));

        // ACT
        List<CommandeResponseDTO> result = commandeService.getMesCommandes("jdupont");

        // ASSERT
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(50L);
        assertThat(result.get(0).getEtat()).isEqualTo(EtatCommande.VALIDEE);
        assertThat(result.get(0).getTotal()).isCloseTo(119.98, within(0.001));
        assertThat(result.get(0).getLignes()).hasSize(1);
        assertThat(result.get(0).getLignes().get(0).getNomProduit()).isEqualTo("Chaussures");
        verify(commandeRepository, times(1)).findByClientUsername("jdupont");
    }

    @Test
    @DisplayName("getMesCommandes — cas limite : aucune commande → liste vide retournée")
    void getMesCommandes_AucuneCommande_RetourneListeVide() {
        // ARRANGE
        when(commandeRepository.findByClientUsername("jdupont")).thenReturn(List.of());

        // ACT
        List<CommandeResponseDTO> result = commandeService.getMesCommandes("jdupont");

        // ASSERT
        assertThat(result).isEmpty();
        // buildDTO ne doit jamais être appelé si la liste est vide
        verify(ligneCommandeRepository, never()).findByCommandeId(any());
    }

    @Test
    @DisplayName("getMesCommandes — plusieurs commandes : chaque commande est mappée en DTO distinct")
    void getMesCommandes_PlusieursCommandes_ChacuneMappeeEnDTO() {
        // ARRANGE
        Commande commande2 = new Commande();
        commande2.setId(51L);
        commande2.setClient(user);
        commande2.setDateCommande(new Date());
        commande2.setEtat(EtatCommande.VALIDEE);
        commande2.setTotal(29.99);

        when(commandeRepository.findByClientUsername("jdupont"))
                .thenReturn(List.of(commande, commande2));
        when(ligneCommandeRepository.findByCommandeId(50L)).thenReturn(List.of(ligneCommande));
        when(ligneCommandeRepository.findByCommandeId(51L)).thenReturn(List.of());

        // ACT
        List<CommandeResponseDTO> result = commandeService.getMesCommandes("jdupont");

        // ASSERT
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(50L);
        assertThat(result.get(1).getId()).isEqualTo(51L);
        verify(ligneCommandeRepository, times(1)).findByCommandeId(50L);
        verify(ligneCommandeRepository, times(1)).findByCommandeId(51L);
    }
}
