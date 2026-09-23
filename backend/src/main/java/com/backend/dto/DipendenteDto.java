package com.backend.dto;

import com.backend.entity.Account;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DipendenteDto {

    private Long id;

    @NotBlank(message = "Nome obbligatorio")
    private String nome;

    @NotBlank(message = "Cognome obbligatorio")
    private String cognome;

    @NotNull(message = "Età obbligatoria")
    private Integer eta;

    @NotBlank(message = "Email personale obbligatoria")
    private String email;

    @NotBlank(message = "Il codice fiscale è obbligatorio")
    @Size(min = 16, max = 16, message = "Il codice fiscale deve avere 16 caratteri")
    private String codiceFiscale;

    @NotNull(message = "Data di nascita obbligatoria")
    private LocalDate dataNascita;

    @NotNull(message = "Stipendio obbligatorio")
    private Double stipendio;

    @NotNull(message = "Data di assunzione obbligatoria")
    private LocalDate dataAssunzione;

    @Valid
    @NotNull(message = "L'account è obbligatorio")
    private AccountDto account;
}
