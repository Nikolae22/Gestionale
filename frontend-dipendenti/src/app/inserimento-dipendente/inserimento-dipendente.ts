import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, NonNullableFormBuilder } from '@angular/forms';
import { DipendenteService } from '../services/dipendente';
import { Dipendente, RuoloEnum } from '../models/dipendente.model';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-inserimento-dipendente',
  standalone: true,
  // IMPORTANTE: Aggiungiamo ReactiveFormsModule per abilitare i form reattivi
  imports: [ReactiveFormsModule],
  templateUrl: './inserimento-dipendente.html'
})
export class InserimentoDipendenteComponent {
  
  private dipService = inject(DipendenteService);
  private fb = inject(NonNullableFormBuilder);
  
  // Questo 'output' ci serve per "urlare" al componente genitore che abbiamo finito l'inserimento
  dipendenteAggiunto = output<void>();

  messaggio = '';
  mostraPassword: boolean = false;

  ruoli=Object.values(RuoloEnum)

  // 1. Definiamo la struttura del form e le regole di validazione
 formInserimento = this.fb.group({
  // Campi del Dipendente al livello principale
  nome: ['', Validators.required],
  cognome: ['', Validators.required],
  eta: [undefined, Validators.required],
  email: ['', [Validators.required, Validators.email]],
  dataNascita: ['', Validators.required],
  codiceFiscale: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
  stipendio: ['', Validators.required],
  dataAssunzione: ['', Validators.required],

  // Sotto-gruppo solo per Account
  account: this.fb.group({
    username: ['', Validators.required],
    emailAziendale: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    ruolo: new FormControl<RuoloEnum | null>(null, [Validators.required])
  })
});


  // 2. Metodo che scatta al click del bottone "Salva"
 onSubmit(): void {
  if (this.formInserimento.invalid) {
      this.formInserimento.markAllAsTouched();
      this.messaggio = 'Per favore, correggi i campi evidenziati prima di proseguire.';
      return;
    }

  this.messaggio = '';

  // Usando Partial<Dipendente> TypeScript non pretenderà l'ID prima del salvataggio
  const payload: Partial<Dipendente> = this.formInserimento.getRawValue();

  this.dipService.insertDipendente(payload).subscribe({
    next: (res) => {
      console.log('Inserito con successo:', res);
      this.messaggio = 'Dipendente inserito con successo!';
      this.formInserimento.reset();
    },
    error: (err) => {
      console.error('Errore:', err);
      this.messaggio = err.error || 'Errore durante il salvataggio.';
    }
  });
}

//helper per vedere gli errori sul form di inserimento
isCampoInvalido(nomeCampo: string, gruppo: string | null = null): boolean {
    const control = gruppo 
      ? this.formInserimento.get(`${gruppo}.${nomeCampo}`)
      : this.formInserimento.get(nomeCampo);

    return !!(control && control.invalid && (control.touched || control.dirty));
  }

    // Estraiamo i valori dal form
   // const formValue = this.formInserimento.value;
 //  const payload: Dipendente = this.formInserimento.getRawValue();

    // // Prepariamo l'oggetto Dipendente
    // const nuovoDipendente = {
    //   nome: formValue.nome!,
    //   cognome: formValue.cognome!,
    //   dataNascita: formValue.dataNascita!,
    //   codice_fiscale: formValue.codice_fiscale!
    // };

    // // Prepariamo l'oggetto Account
    // const nuovoAccount = {
    //   username: formValue.username!,
    //   email: formValue.email!,
    //   password: formValue.password!
    // };

    // 3. Facciamo la chiamata POST al backend Spring Boot
    // this.dipService.insertDipendenteAndAccount(nuovoDipendente, nuovoAccount).subscribe({
    //   next: (risposta) => {
    //     this.messaggio = 'Dipendente e Account inseriti con successo!';
    //     this.formInserimento.reset(); // Svuota il form
    //     this.dipendenteAggiunto.emit(); // Lancia l'evento per far aggiornare la tabella
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.messaggio = 'Errore durante l\'inserimento. Verifica i dati o la connessione.';
    //   }
    // });

 // }

  //togle password
  toggleMostraPassword(): void {
    this.mostraPassword = !this.mostraPassword;
  }

}