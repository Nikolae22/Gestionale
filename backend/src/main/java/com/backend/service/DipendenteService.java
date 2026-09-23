package com.backend.service;

import com.backend.dto.DipendenteDto;
import com.backend.enumerated.RuoloEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DipendenteService {

     DipendenteDto insertDipendente(DipendenteDto d);

    void deleteDipendente(Long id) throws Exception;

    void deleteDipendenteByCodiceFiscale(String codiceFiscale);

    DipendenteDto findDipendenteByCf(String codiceFiscale);

    Page<DipendenteDto> findAllDip(Pageable pageable);

    Page<DipendenteDto> cercaDipendentiPerEmail(String email, Pageable pageable);

    DipendenteDto updateDipendente(DipendenteDto d);

    DipendenteDto findByEmail(String email) throws Exception;

    List<DipendenteDto> findByRuolo(RuoloEnum ruoloEnum);

    List<DipendenteDto> findByStipendio(Double stipendio);

    List<DipendenteDto> getDipendentiByRuoloEStipendio(RuoloEnum ruolo, Double stipendioMinimo);
}
