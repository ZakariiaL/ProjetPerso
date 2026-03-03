package com.backend_mustaparfum.repository;


import com.backend_mustaparfum.model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProduitRepository extends JpaRepository<Produit, Long> {
}
