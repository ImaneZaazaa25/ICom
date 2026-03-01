package com.ICom.Icom.Repositories;

import com.ICom.Icom.Model.LignePanier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LignePanierRepository extends JpaRepository<LignePanier, Long> {
    List<LignePanier> findByPanierId(Long panierId);
}
