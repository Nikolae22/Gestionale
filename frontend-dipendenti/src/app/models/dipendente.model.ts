export interface Account {
  id?: number;
  username: string;
  emailAziendale: string;
  password?: string;
  ruolo?: RuoloEnum | null;
}

export interface Dipendente {
  id?: number; // <-- ? per rende id opzionale
  nome: string;
  cognome: string;
  eta: number;
  email: string; // <-- Rinominato da email a emailPersonale
  codiceFiscale: string;
  dataNascita: string;
  stipendio: string;
  dataAssunzione: string;
  account: Account;
}


export enum RuoloEnum {
   PROGRAMMATORE='PROGRAMMATORE', PROJECT_MANAGER='PROJECT_MANAGER', TOP_MANAGER="TOP_MANAGER", OWNER="OWNER"
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

