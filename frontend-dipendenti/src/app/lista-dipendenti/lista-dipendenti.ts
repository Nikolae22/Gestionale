import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { DipendenteService } from '../services/dipendente';
import { Dipendente, PageResponse } from '../models/dipendente.model';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FiltroDipendentiEvent, FiltroDipendentiComponent } from '../filtro-dipendenti/filtro-dipendenti';

export type ModalitaView = 'LISTA' | 'INSERIMENTO' | 'MODIFICA' | 'INFO';

@Component({
  selector: 'app-lista-dipendenti',
  standalone: true,
  imports: [
    ReactiveFormsModule, CurrencyPipe, DatePipe, FormsModule,
    FiltroDipendentiComponent
  ],
  templateUrl: './lista-dipendenti.html',
  styleUrls: ['./lista-dipendenti.css']
})
export class ListaDipendentiComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dipendenteService = inject(DipendenteService);

  // signals per lo stato
  listaDipendenti = signal<Dipendente[]>([]);
  modalita = signal<ModalitaView>('LISTA');
  isDrawerAperto = signal<boolean>(false);

  //signals per la paginazione del get all
  currentPage=signal<number>(0)
  totalPages=signal<number>(0)
  totalElements=signal<number>(0)
  isFirst=signal<boolean>(true);
  isLast=signal<boolean>(false)
  pageSize=10;

  //siganl per cerca email per type

  paginaCorrente = signal<number>(0);
isUltimaPagina = signal<boolean>(false);

  //singals per gestire il conferma della eleminazione
  dipendenteDaEleminare=signal<Dipendente | null>(null);
  mostraModalConf=signal<boolean>(false);

  dipendenteSelezionatoId = signal<number | null>(null);
  dipendenteSelezionato = signal<Dipendente | null>(null);

  messaggioSuccesso = signal<string>('');
  messaggioErrore = signal<string>('');

  ruoli = signal<string[]>(['PROGRAMMATORE', 'PROJECT_MANAGER', 'TOP_MANAGER']);

  dipendenteForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.caricaListaDipendenti();
  }

  initForm(): void {
    this.dipendenteForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      eta: [null, [Validators.required, Validators.min(18), Validators.max(65)]],
      email: ['', [Validators.required, Validators.email]],
      dataNascita: ['', [Validators.required, this.validatoreMaggioreEta()]],
      codiceFiscale: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      stipendio: [null, [Validators.required, Validators.min(0)]],
      dataAssunzione: ['', Validators.required],
      account: this.fb.group({
        username: ['', Validators.required],
        emailAziendale: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        ruolo: ['', Validators.required]
      })
    }, {
      validators: [
        this.validatoreStipendioRuolo(),
        this.validatoreEtaAssunzione()
      ]
    });

    this.dipendenteForm.get('account.ruolo')?.valueChanges.subscribe(() => {
      this.dipendenteForm.get('stipendio')?.updateValueAndValidity();
    });
  }

  //senza paginataion
  // caricaListaDipendenti(): void {
  //   this.dipendenteService.findAllDipendenti().subscribe({
  //     next: (data) => this.listaDipendenti.set(data),
  //     error: (err) => console.error('Errore caricamento', err)
  //   });
  // }

  //con pagination
  caricaListaDipendenti(page: number = 0): void {
  this.dipendenteService.findAllDipendenti(page, this.pageSize).subscribe({
    next: (response: any) => {
      console.log('Dati ricevuti dal backend:', response);

      // Estrai l'array dei dati dall'oggetto Page di Spring Boot
      const lista = response?.content || response || [];

      this.listaDipendenti.set(lista);
      this.currentPage.set(response?.number ?? page);
      this.totalPages.set(response?.totalPages ?? 1);
      this.totalElements.set(response?.totalElements ?? lista.length);
      this.isFirst.set(response?.first ?? true);
      this.isLast.set(response?.last ?? true);
    },
    error: (err) => {
      console.error('Errore durante la chiamata HTTP:', err);
      this.listaDipendenti.set([]);
    }
  });
}

  //pag precente
  paginaPrecedente():void{
    if(!this.isFirst()){
      this.caricaListaDipendenti(this.currentPage()-1);
    }
  }

  paginaSuccessiva():void{
    if(!this.isLast()){
      this.caricaListaDipendenti(this.currentPage() +1);
    }
  }

  cambiaModalita(nuovaModalita: ModalitaView, dipendente?: Dipendente): void {
    this.modalita.set(nuovaModalita);
    this.messaggioSuccesso.set('');
    this.messaggioErrore.set('');

    const passwordControl = this.dipendenteForm.get('account.password');

    if (nuovaModalita === 'INSERIMENTO') {
      this.dipendenteSelezionatoId.set(null);
      this.dipendenteSelezionato.set(null);
      this.dipendenteForm.reset();
      passwordControl?.setValidators([Validators.required, Validators.minLength(8)]);
      passwordControl?.updateValueAndValidity();
      this.isDrawerAperto.set(true);

    } else if (nuovaModalita === 'MODIFICA' && dipendente) {
      this.dipendenteSelezionatoId.set(dipendente.id || null);
      this.dipendenteSelezionato.set(dipendente);
      
      passwordControl?.clearValidators();
      passwordControl?.updateValueAndValidity();

      this.dipendenteForm.patchValue({
        nome: dipendente.nome,
        cognome: dipendente.cognome,
        eta: dipendente.eta,
        email: dipendente.email,
        dataNascita: dipendente.dataNascita,
        codiceFiscale: dipendente.codiceFiscale,
        stipendio: dipendente.stipendio,
        dataAssunzione: dipendente.dataAssunzione,
        account: {
          username: dipendente.account?.username || '',
          emailAziendale: dipendente.account?.emailAziendale || '',
          password: '',
          ruolo: dipendente.account?.ruolo || ''
        }
      });
      this.isDrawerAperto.set(true);

    } else if (nuovaModalita === 'INFO' && dipendente) {
      this.dipendenteSelezionato.set(dipendente);
      this.isDrawerAperto.set(true);

    } else if (nuovaModalita === 'LISTA') {
      this.isDrawerAperto.set(false);
      this.dipendenteSelezionato.set(null);
      this.dipendenteSelezionatoId.set(null);
    }
  }

  clickSulloSfondo(): void {
    if (this.modalita() === 'INFO') {
      this.cambiaModalita('LISTA');
    }
  }

  isCampoInvalido(campo: string, sottoGruppo?: string): boolean {
    const control = sottoGruppo 
      ? this.dipendenteForm.get(`${sottoGruppo}.${campo}`) 
      : this.dipendenteForm.get(campo);

    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  salvaDipendente(): void {
    if (this.dipendenteForm.invalid) {
      this.dipendenteForm.markAllAsTouched();
      return;
    }

    const datiForm = this.dipendenteForm.value;

    if (this.modalita() === 'INSERIMENTO') {
      this.dipendenteService.insertDipendente(datiForm).subscribe({
        next: () => {
          this.messaggioSuccesso.set('Dipendente inserito!');
          this.caricaListaDipendenti();
          this.cambiaModalita('LISTA');
        },
        error: () => this.messaggioErrore.set('Errore durante l\'inserimento.')
      });

    } else if (this.modalita() === 'MODIFICA' && this.dipendenteSelezionatoId()) {
      const dipendenteAggiornato: Partial<Dipendente> = {
        id: this.dipendenteSelezionatoId()!,
        ...datiForm
      };

      this.dipendenteService.updateDipendente(dipendenteAggiornato).subscribe({
        next: () => {
          this.messaggioSuccesso.set('Dipendente modificato!');
          this.caricaListaDipendenti();
          this.cambiaModalita('LISTA');
        },
        error: () => this.messaggioErrore.set('Errore durante la modifica.')
      });
    }
  }

  // SEARCH & FILTER HANDLERS
  cercaPerRuoloEStipendio(event: FiltroDipendentiEvent): void {
    this.dipendenteService.findDipendentiByRuoloAndStipendio(event.ruolo, event.stipendio).subscribe({
      next: (risultati) => {
        this.listaDipendenti.set(risultati)
      },
      error: (err) => console.error('Errore durante la ricerca:', err)
    });
  }

  

  //ricerca per eimail
  // cercaPerEmail(email:string):void{
  //   this.dipendenteService.findByEmail(email).subscribe({
  //     next:(dipendente)=>{
  //       this.listaDipendenti.set(dipendente ? [dipendente] :[])
  //     },
  //     error:err=>{
  //       console.log("Errore durante la ricerca per email ",err)
  //       this.listaDipendenti.set([])
  //     }
  //   })
  // }

  cercaPerEmail(email: string, page: number = 0): void {
  const emailPulita = email ? email.trim() : '';

  this.dipendenteService.findByEmail(emailPulita, page, 10).subscribe({
    next: (res: PageResponse<Dipendente>) => {
      this.listaDipendenti.set(res.content);
      this.paginaCorrente.set(res.number);
      
      // Se 'last' non fosse presente nella risposta, il fallback evita errori
      this.isUltimaPagina.set(res.last ?? (res.number >= res.totalPages - 1));
    },
    error: (err) => {
      console.error("Errore durante la ricerca per email:", err);
      this.listaDipendenti.set([]);
    }
  });
}

  resetFiltro(): void {
    this.caricaListaDipendenti();
  }

  //elima per cf
  // 1. Apre il popup 
chiediConfermaEliminazione(dip: Dipendente, event?: Event): void {
  if (event) {
    event.stopPropagation(); // Evita di aprire la riga se si clicca sulla tabella
  }
  this.dipendenteDaEleminare.set(dip);
  this.mostraModalConf.set(true);
}

// 2 chiudo popup
annullaEliminazione(): void {
  this.mostraModalConf.set(false);
  this.dipendenteDaEleminare.set(null);
}

// 3. cancello
confermaEliminazione(): void {
  const dip = this.dipendenteDaEleminare();
  if (!dip || !dip.codiceFiscale) return;

  this.dipendenteService.deleteDipendenteByCf(dip.codiceFiscale).subscribe({
    next: () => {
      // 1. Chiudi SEMPRE il drawer e resetta lo stato a 'LISTA', a prescindere dall'ID
      this.cambiaModalita('LISTA');

      // 2. Chiudi il popup di conferma
      this.annullaEliminazione();

      // 3. Mostra il messaggio di successo sopra la tabella
      this.messaggioSuccesso.set('Dipendente eliminato con successo!');
      setTimeout(() => this.messaggioSuccesso.set(''), 3000);

      // 4. Ricarica la lista aggiornata dal DB per la pagina corrente
      this.caricaListaDipendenti(this.currentPage());
    },
    error: (err) => {
      console.error('Errore durante l\'eliminazione:', err);
      this.messaggioErrore.set('Si è verificato un errore durante l\'eliminazione.');
      this.annullaEliminazione();
    }
  });
}

  // validatori per ruolo e range stipendio
  validatoreStipendioRuolo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const stipendio = control.get('stipendio')?.value;
      const ruolo = control.get('account.ruolo')?.value;

      if (stipendio === null || stipendio === undefined || !ruolo) return null;
      const val = Number(stipendio);

      switch (ruolo) {
        case 'PROGRAMMATORE':
          if (val < 1200 || val > 1400) return { stipendioFuoriRange: 'Stipendio Programmatore tra 1200€ e 1400€' };
          break;
        case 'PROJECT_MANAGER':
          if (val < 1400 || val > 1600) return { stipendioFuoriRange: 'Stipendio PM tra 1400€ e 1600€' };
          break;
        case 'TOP_MANAGER':
          if (val < 1600 || val > 2000) return { stipendioFuoriRange: 'Stipendio Top Manager tra 1600€ e 2000€' };
          break;
      }
      return null;
    };
  }

  //per eta di asunzione 
  validatoreEtaAssunzione(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const nascitaVal = control.get('dataNascita')?.value;
      const assunzioneVal = control.get('dataAssunzione')?.value;

      if (!nascitaVal || !assunzioneVal) return null;

      const nascita = new Date(nascitaVal);
      const assunzione = new Date(assunzioneVal);

      let eta = assunzione.getFullYear() - nascita.getFullYear();
      const m = assunzione.getMonth() - nascita.getMonth();
      if (m < 0 || (m === 0 && assunzione.getDate() < nascita.getDate())) eta--;

      if (eta < 18 || eta > 65) return { etaNonValida: 'Età all\'assunzione deve essere tra 18 e 65 anni' };

      return null;
    };
  }

  validatoreMaggioreEta(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const dataNascita = new Date(control.value);
      const oggi = new Date();

      let eta = oggi.getFullYear() - dataNascita.getFullYear();
      const mese = oggi.getMonth() - dataNascita.getMonth();

      if (mese < 0 || (mese === 0 && oggi.getDate() < dataNascita.getDate())) {
        eta--;
      }

      if (eta < 18) {
        return { minoreEta: 'Il dipendente deve essere maggiorenne (almeno 18 anni).' };
      }

      return null;
    };
  }

  ///metodi per ral netto irpef tasse // Computed che calcola i dettagli finanziari del dipendente selezionato
costiDipendente = computed(() => {
  const dip = this.dipendenteSelezionato();
  if (!dip || !dip.stipendio) {
    return {
      nettoMensile: 0,
      nettoAnnuale: 0,
      lordoMensile: 0,
      ralAnnuale: 0,
      costoMensileAzienda: 0,
      costoAnnualeAzienda: 0,
      tasseContributiMensili: 0,
      tasseContributiAnnuali: 0
    };
  }

  // Consideriamo che 'dip.stipendio' sia lo Stipendio Netto Mensile (su 13 mensilità)
  const nettoMensile = Number(dip.stipendio);
  const mensilita = 13;
  const nettoAnnuale = nettoMensile * mensilita;

  // Moltiplicatore stimato per passare da Netto a RAL Lorda (~1.45)
  const lordoMensile = nettoMensile * 1.45;
  const ralAnnuale = lordoMensile * mensilita;

  // Moltiplicatore stimato per il Costo Azienda Totale (+32% tra contributi datore + TFR)
  const costoMensileAzienda = lordoMensile * 1.32;
  const costoAnnualeAzienda = costoMensileAzienda * mensilita;

  // Tasse e Contributi Totali (Costo Azienda - Netto Dipendente)
  const tasseContributiMensili = costoMensileAzienda - nettoMensile;
  const tasseContributiAnnuali = costoAnnualeAzienda - nettoAnnuale;

  return {
    nettoMensile,
    nettoAnnuale,
    lordoMensile,
    ralAnnuale,
    costoMensileAzienda,
    costoAnnualeAzienda,
    tasseContributiMensili,
    tasseContributiAnnuali
  };
});
}