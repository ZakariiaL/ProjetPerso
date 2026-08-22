package com.backend_mustaparfum.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String brand;
    private String category;
    private String imageUrl;
    private double price;
    private boolean inStock;
    private String concentration;
    private String volume;
    private String topNotes;
    private String heartNotes;
    private String baseNotes;



    public Produit() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }

    public String getConcentration() {
        return concentration;
    }

    public void setConcentration(String concentration) {
        this.concentration = concentration;
    }

    public String getVolume() {
        return volume;
    }

    public void setVolume(String volume) {
        this.volume = volume;
    }

    public String getTopNotes() {
        return topNotes;
    }

    public void setTopNotes(String topNotes) {
        this.topNotes = topNotes;
    }

    public String getHeartNotes() {
        return heartNotes;
    }

    public void setHeartNotes(String heartNotes) {
        this.heartNotes = heartNotes;
    }

    public String getBaseNotes() {
        return baseNotes;
    }

    public void setBaseNotes(String baseNotes) {
        this.baseNotes = baseNotes;
    }



}
