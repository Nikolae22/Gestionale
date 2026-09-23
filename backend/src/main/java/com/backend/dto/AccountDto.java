package com.backend.dto;

import com.backend.enumerated.RuoloEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountDto {

 private Long id;

 @NotBlank(message = "Username obbligatorio")
 private String username;

 @NotBlank(message = "Email aziendale obbligatoria")
 private String emailAziendale;

 //@NotBlank(message = "Password obbligatoria") lho tolta cosi se dal front end faccio modifica e non la cambio mi prende quella vecchia
 private String password;

 @NotNull(message = "Il ruolo è obbligatorio")
 private RuoloEnum ruolo;
}

