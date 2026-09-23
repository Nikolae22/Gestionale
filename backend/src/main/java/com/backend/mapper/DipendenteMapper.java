package com.backend.mapper;

import com.backend.dto.DipendenteDto;
import com.backend.entity.Dipendente;
import org.springframework.stereotype.Component;

@Component
public class DipendenteMapper {


    public static Dipendente toEntity(DipendenteDto dto) {
        if (dto == null) {
            return null;
        }

        Dipendente dipendente = new Dipendente();
        dipendente.setId(dto.getId());
        dipendente.setNome(dto.getNome());
        dipendente.setCognome(dto.getCognome());
        dipendente.setEta(dto.getEta());
        dipendente.setEmail(dto.getEmail());
        dipendente.setCodiceFiscale(dto.getCodiceFiscale());
        dipendente.setDataNascita(dto.getDataNascita());
        dipendente.setStipendio(dto.getStipendio());
        dipendente.setDataAssunzione(dto.getDataAssunzione());


        if (dto.getAccount() != null) {
            dipendente.setAccount(AccountMapper.toEntity(dto.getAccount()));
        }

        return dipendente;
    }


    public static DipendenteDto toDto(Dipendente entity) {
        if (entity == null) {
            return null;
        }

        DipendenteDto dto = new DipendenteDto();
        dto.setId(entity.getId());
        dto.setNome(entity.getNome());
        dto.setCognome(entity.getCognome());
        dto.setEta(entity.getEta());
        dto.setEmail(entity.getEmail());
        dto.setCodiceFiscale(entity.getCodiceFiscale());
        dto.setDataNascita(entity.getDataNascita());
        dto.setStipendio(entity.getStipendio());
        dto.setDataAssunzione(entity.getDataAssunzione());

        if (entity.getAccount() != null) {
            dto.setAccount(AccountMapper.toDto(entity.getAccount()));
        }

        return dto;
    }
}
