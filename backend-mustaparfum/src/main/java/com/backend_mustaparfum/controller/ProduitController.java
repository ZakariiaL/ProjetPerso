package com.backend_mustaparfum.controller;

import com.backend_mustaparfum.model.Produit;
import com.backend_mustaparfum.service.ProduitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produits")
@CrossOrigin(origins = "*")
public class ProduitController {

    private final ProduitService service;
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads";

    public ProduitController(ProduitService service) {
        this.service = service;
    }

    @GetMapping
    public List<Produit> getProduits() {
        return service.getAll();
    }

    @PostMapping
    public Produit ajouterProduit(@RequestBody Produit produit) {
        return service.addProduit(produit);
    }



    @PutMapping("/{id}")
    public ResponseEntity<Produit> modifierProduit(@PathVariable Long id, @RequestBody Produit produitDetails) {
        return service.updateProduit(id, produitDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerProduit(@PathVariable Long id) {
        return service.deleteProduit(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }


    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile image) {
        try {
            // Créer le dossier si inexistant
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            // Générer un nom de fichier unique
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR, fileName);

            // Écrire le fichier sur le disque
            Files.write(filePath, image.getBytes());

            // Construire l'URL d'accès
            String imageUrl = "/uploads/" + fileName;

            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors du téléversement : " + e.getMessage());
        }
    }

}
