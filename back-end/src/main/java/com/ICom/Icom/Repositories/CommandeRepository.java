package com.ICom.Icom.Repositories;

import com.ICom.Icom.Model.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {
    // chercher commande par nom
    List<Commande> findByClientUsername(String username);
}
