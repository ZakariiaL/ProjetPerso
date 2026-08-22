package com.backend_mustaparfum.service;


import com.backend_mustaparfum.model.Produit;
import com.backend_mustaparfum.repository.ProduitRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    private final ProduitRepository repository;

    public ProduitService(ProduitRepository repository) {
        this.repository = repository;
    }

    public List<Produit> getAll() {
        return repository.findAll();
    }

    public Produit addProduit(Produit produit) {
        return repository.save(produit);
    }

    public Optional<Produit> updateProduit(Long id, Produit produitDetails) {
        return repository.findById(id).map(produit -> {
            produit.setName(produitDetails.getName());
            produit.setDescription(produitDetails.getDescription());
            produit.setBrand(produitDetails.getBrand());
            produit.setCategory(produitDetails.getCategory());
            produit.setImageUrl(produitDetails.getImageUrl());
            produit.setPrice(produitDetails.getPrice());
            produit.setInStock(produitDetails.isInStock());
            produit.setConcentration(produitDetails.getConcentration());
            produit.setVolume(produitDetails.getVolume());
            produit.setTopNotes(produitDetails.getTopNotes());
            produit.setHeartNotes(produitDetails.getHeartNotes());
            produit.setBaseNotes(produitDetails.getBaseNotes());
            return repository.save(produit);
        });
    }

    public boolean deleteProduit(Long id) {
        return repository.findById(id).map(produit -> {
            repository.delete(produit);
            return true;
        }).orElse(false);
    }

}
