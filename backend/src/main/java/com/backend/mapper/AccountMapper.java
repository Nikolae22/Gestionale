package com.backend.mapper;

import com.backend.dto.AccountDto;
import com.backend.entity.Account;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {

    public static Account toEntity(AccountDto dto) {
        if (dto == null) {
            return null;
        }

        Account account = new Account();
        account.setId(dto.getId());
        account.setUsername(dto.getUsername());
        account.setEmailAziendale(dto.getEmailAziendale());
        account.setPassword(dto.getPassword());
        account.setRuolo(dto.getRuolo());

        return account;
    }

    public static AccountDto toDto(Account entity) {
        if (entity == null) {
            return null;
        }

        AccountDto dto = new AccountDto();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setEmailAziendale(entity.getEmailAziendale());
        dto.setPassword(entity.getPassword());
        dto.setRuolo(entity.getRuolo());

        return dto;
    }
}
