package com.backend.repository;

import com.backend.entity.Dipendente;
import com.backend.enumerated.RuoloEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DipedenteReposiotry extends JpaRepository<Dipendente,Long> {

    Optional<Dipendente> findByCodiceFiscale(String codiceFiscale);

    int deleteByCodiceFiscale(String codiceFiscale);

    Optional<Dipendente> findByEmail(String email);

    // Trova le email che iniziano con il testo digitato, applicando la paginazione
    Page<Dipendente> findByEmailStartingWithIgnoreCase(String email, Pageable pageable);

    // relazione @OneToOne da Dipendente -> Account -> Ruolo
    List<Dipendente> findByAccountRuolo(RuoloEnum ruolo);

    List<Dipendente> findByStipendio(Double stipendio);

    @Query("SELECT d FROM Dipendente d LEFT JOIN d.account a WHERE " +
            "(:ruolo IS NULL OR a.ruolo = :ruolo) AND " +
            "(:stipendio IS NULL OR d.stipendio >= :stipendio)")
    List<Dipendente> findByAccountRuoloAndStipendioGreaterThanEqual(@Param("ruolo") RuoloEnum ruolo,
                                                                    @Param("stipendio") Double stipendio);
}
