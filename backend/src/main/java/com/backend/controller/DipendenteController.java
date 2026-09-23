package com.backend.controller;


import com.backend.dto.DipendenteDto;
import com.backend.enumerated.RuoloEnum;
import com.backend.service.DipendenteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins="http://localhost:4200", maxAge=3600)
@RestController
@RequestMapping({"/crudDipendente"})
@RequiredArgsConstructor
public class DipendenteController {

    private final DipendenteService dipService;

    @GetMapping("/findAllDipedenti")
    public ResponseEntity<Page<DipendenteDto>> getAll(
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        return ResponseEntity.ok(dipService.findAllDip(pageable));
    }

    @GetMapping("/byemail")
    public ResponseEntity<DipendenteDto> findByEmail(
            @RequestParam String email) throws Exception {
        return ResponseEntity.ok(dipService.findByEmail(email));
    }

    @GetMapping("/email")
    public ResponseEntity<Page<DipendenteDto>> cerca(
            @RequestParam(required = false, defaultValue = "") String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<DipendenteDto> risultato = dipService.cercaDipendentiPerEmail(email, pageable);
        return ResponseEntity.ok(risultato);
    }

    @GetMapping("/ruolo")
    public ResponseEntity<List<DipendenteDto>> findByRuolo(
            @RequestParam RuoloEnum ruoloEnum){
        return ResponseEntity.ok(dipService.findByRuolo(ruoloEnum));
    }

    @GetMapping("/stipendio")
    public ResponseEntity<List<DipendenteDto>> findByStipendio(
            @RequestParam Double stipendio){
        return ResponseEntity.ok(dipService.findByStipendio(stipendio));
    }

    @GetMapping("/findDipendentiByRuoloAndStipendio")
    public ResponseEntity<List<DipendenteDto>> findDipendentiByRuoloAndStipendio(
            @RequestParam(required = false) RuoloEnum ruolo,
            @RequestParam(required = false) Double stipendio) {
        List<DipendenteDto> dipendenti = dipService.getDipendentiByRuoloEStipendio(ruolo, stipendio);
        return ResponseEntity.ok(dipendenti);
    }


    @PostMapping("/create")
    public ResponseEntity<DipendenteDto> insertDipedente(
            @RequestBody @Valid DipendenteDto dipendente){
        return ResponseEntity.ok(dipService.insertDipendente(dipendente));
    }

    @PatchMapping("/update")
    public ResponseEntity<DipendenteDto> updateDipedente(
            @RequestBody @Valid DipendenteDto dipendente){
        return ResponseEntity.ok(dipService.updateDipendente(dipendente));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> delete(
            @RequestParam String cf){
        dipService.deleteDipendenteByCodiceFiscale(cf);
        return ResponseEntity.ok("Dipendente deleted");
    }
}
