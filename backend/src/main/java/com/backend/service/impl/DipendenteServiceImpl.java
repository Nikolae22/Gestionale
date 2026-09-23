package com.backend.service.impl;

import com.backend.dto.AccountDto;
import com.backend.dto.DipendenteDto;
import com.backend.entity.Account;
import com.backend.entity.Dipendente;
import com.backend.enumerated.RuoloEnum;
import com.backend.exception.ResourceNotFoundException;
import com.backend.mapper.DipendenteMapper;
import com.backend.repository.AccountRepository;
import com.backend.repository.DipedenteReposiotry;
import com.backend.service.DipendenteService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DipendenteServiceImpl implements DipendenteService {


    private final DipedenteReposiotry dr;


    @Override
    public DipendenteDto insertDipendente(DipendenteDto d) {
        validaStipendioPerRuolo(d);
        Dipendente saved = DipendenteMapper.toEntity(d);
        dr.save(saved);
        return DipendenteMapper.toDto(saved);
    }


    @Override
    @Transactional
    public void deleteDipendente(Long id) {
        Dipendente dipendente = dr.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dipendente non trovato con id: " + id));
        dr.delete(dipendente);
    }

    public DipendenteDto findDipendenteByCf(String codiceFiscale) {
        Dipendente dipendente = dr.findByCodiceFiscale(codiceFiscale)
                .orElseThrow(() -> new ResourceNotFoundException("Dipendente non trovato con CF: " + codiceFiscale));
        return DipendenteMapper.toDto(dipendente);
    }

    @Override
    public Page<DipendenteDto> findAllDip(Pageable pageable) {
        Page<Dipendente> paginaDipendenti = dr.findAll(pageable);
        return paginaDipendenti.map(DipendenteMapper::toDto);
    }

    @Override
    @Transactional
    public DipendenteDto updateDipendente(DipendenteDto d) {
        if (d.getId() == null) {
            throw new IllegalArgumentException("ID Dipendente mancante per l'aggiornamento.");
        }

        // 1. Recupero l'entità esistente dal DB
        Dipendente dipendenteEsistente = dr.findById(d.getId())
                .orElseThrow(() -> new EntityNotFoundException("Dipendente non trovato con ID: " + d.getId()));

        // 2. Aggiornare i campi del Dipendente dal DTO
        dipendenteEsistente.setNome(d.getNome());
        dipendenteEsistente.setCognome(d.getCognome());
        dipendenteEsistente.setEta(d.getEta());
        dipendenteEsistente.setEmail(d.getEmail());
        dipendenteEsistente.setDataNascita(d.getDataNascita());
        dipendenteEsistente.setCodiceFiscale(d.getCodiceFiscale());
        dipendenteEsistente.setStipendio(d.getStipendio());
        dipendenteEsistente.setDataAssunzione(d.getDataAssunzione());

        // 3. Aggiorno i campi dell'Account
        if (d.getAccount() != null && dipendenteEsistente.getAccount() != null) {
            Account accountEsistente = dipendenteEsistente.getAccount();
            AccountDto accountDto = d.getAccount();

            accountEsistente.setUsername(accountDto.getUsername());
            accountEsistente.setEmailAziendale(accountDto.getEmailAziendale());
            accountEsistente.setRuolo(accountDto.getRuolo());

            // Aggiornare la password solo se ne è stata inviata una nuova
            if (accountDto.getPassword() != null && !accountDto.getPassword().isBlank()) {
                accountEsistente.setPassword(accountDto.getPassword());
            }
        }

        // 4. Eseguire eventuali logiche di business sull'entità
        validaStipendioPerRuolo(d);

        // 5. Salvare sul DB
        Dipendente dipendenteSalvato = dr.save(dipendenteEsistente);

        // 6. Convertire l'entità salvata nel DTO di risposta tramite il mapper
        return DipendenteMapper.toDto(dipendenteSalvato);
    }

    @Override
    public DipendenteDto findByEmail(String email) throws Exception {
      Dipendente dipendente=  dr.findByEmail(email)
              .orElseThrow(()->new EntityNotFoundException("Email dosent exists"));
        return DipendenteMapper.toDto(dipendente);
    }

    @Override
    public Page<DipendenteDto> cercaDipendentiPerEmail(String email, Pageable pageable) {
        return dr
                .findByEmailStartingWithIgnoreCase(email.trim(), pageable)
                .map(DipendenteMapper::toDto);
    }



    @Override
    public List<DipendenteDto> findByRuolo(RuoloEnum ruoloEnum) {
        List<Dipendente> dipendenti = dr.findByAccountRuolo(ruoloEnum);
        return dipendenti.stream()
                .map(DipendenteMapper::toDto)
                .toList();
    }

    @Override
    public List<DipendenteDto> findByStipendio(Double stipendio) {
        List<Dipendente> dipendenti = dr.findByStipendio(stipendio);
        return dipendenti.stream()
                .map(DipendenteMapper::toDto)
                .toList();
    }

    @Override
    public List<DipendenteDto> getDipendentiByRuoloEStipendio(RuoloEnum ruolo, Double stipendioMinimo) {
        List<Dipendente> dipendenti = dr.findByAccountRuoloAndStipendioGreaterThanEqual(ruolo, stipendioMinimo);
        return dipendenti.stream()
                .map(DipendenteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDipendenteByCodiceFiscale(String codiceFiscale) {
        Dipendente dipendente=dr.findByCodiceFiscale(codiceFiscale)
                .orElseThrow(()-> new EntityNotFoundException("codice fiscale non presente controla il cf"));
         dr.delete(dipendente);
    }


    private void validaStipendioPerRuolo(DipendenteDto dipendente) {
        if (dipendente == null || dipendente.getStipendio() == null || dipendente.getAccount() == null) {
            return;
        }
        RuoloEnum ruolo = dipendente.getAccount().getRuolo();
        Double stipendio = dipendente.getStipendio();

        if (ruolo == null) return;

        switch (ruolo) {
            case PROGRAMMATORE -> {
                if (stipendio < 1200 || stipendio > 1400) {
                    throw new IllegalArgumentException(
                            "Lo stipendio per un Programmatore deve essere tra 1200 e 1400"
                    );
                }
            }

            case PROJECT_MANAGER -> {
                if (stipendio < 1400 || stipendio > 1600) {
                    throw new IllegalArgumentException(
                            "Lo stipendio per un Project Manager deve essere tra 1400 e 1600"
                    );
                }
            }

            case TOP_MANAGER -> {
                if (stipendio < 1600 || stipendio > 2000) {
                    throw new IllegalArgumentException(
                            "Lo stipendio per un Top Manager deve essere tra 1600 e 2000"
                    );
                }
            }
        }

    }



}
