import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DipendenteService } from '../services/dipendente';
import { Dipendente } from '../models/dipendente.model';

export interface StatsPerRuolo {
  ruolo: string;
  conteggio: number;
  spesaMensileNetta: number;
  spesaAnnualeNetta: number;
  costoAnnualeAzienda: number;
  percentuale: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './stats.html',
  styleUrls: ['./stats.css']
})
export class Stats implements OnInit {

  private dipendenteService = inject(DipendenteService);

  //signals dipendenti
  listaDipendenti = signal<Dipendente[]>([]);
  isLoading = signal<boolean>(true);
  messaggioErrore = signal<string>('');

  // Costanti per le stime economiche
  readonly MENSILITA = 13;
  readonly MOLTIPLICATORE_LORDO = 1.45; // Stima Lordo/RAL
  readonly MOLTIPLICATORE_COSTO_AZIENDA = 1.32; // Stima INPS, INAIL, TFR (+32%)

  ngOnInit(): void {
    this.caricaTuttiDipendenti();
  }

  caricaTuttiDipendenti(): void {
    this.isLoading.set(true);
    // Recuperiamo un numero elevato di elementi per la statistica globale
    this.dipendenteService.findAllDipendenti(0, 1000).subscribe({
      next: (response: any) => {
        const lista = response?.content || response || [];
        this.listaDipendenti.set(lista);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore durante il recupero dei dati per le statistiche:', err);
        this.messaggioErrore.set('Impossibile caricare i dati delle statistiche.');
        this.isLoading.set(false);
      }
    });
  }

  // --- COMPUTED SIGNALS PER STATISTICHE GLOBALI ---

  // 1. Totale assunti
  totaleAssunti = computed(() => this.listaDipendenti().length);

  // 2. Totale Netto Mensile
  totaleNettoMensile = computed(() => {
    return this.listaDipendenti().reduce((acc, d) => acc + (Number(d.stipendio) || 0), 0);
  });

  // 3. Totale Netto Annuale (13 mensilità)
  totaleNettoAnnuale = computed(() => this.totaleNettoMensile() * this.MENSILITA);

  // 4. RAL Totale Lordo Annuale
  totaleRalAnnuale = computed(() => {
    return this.totaleNettoMensile() * this.MOLTIPLICATORE_LORDO * this.MENSILITA;
  });

  // 5. Costo Totale Annuale Azienda (RAL + Contributi Datore + TFR)
  costoTotaleAnnualeAzienda = computed(() => {
    return this.totaleNettoMensile() * this.MOLTIPLICATORE_LORDO * this.MOLTIPLICATORE_COSTO_AZIENDA * this.MENSILITA;
  });

  // 6. Contributi e Tasse Totali Pagati dall'Azienda ogni anno
  totaleContributiETasseAnnuali = computed(() => {
    return this.costoTotaleAnnualeAzienda() - this.totaleNettoAnnuale();
  });


  
  statsPerRuolo = computed<StatsPerRuolo[]>(() => {
    const dipendenti = this.listaDipendenti();
    const totaleNettoG = this.totaleNettoMensile();

    if (dipendenti.length === 0) return [];

    const mappa = new Map<string, { conteggio: number; spesaMensile: number }>();

    dipendenti.forEach(d => {
      // Prende il ruolo dall'account o assegna NON_SPECIFICATO
      const ruolo = d.account?.ruolo || 'NON_SPECIFICATO';
      const stipendio = Number(d.stipendio) || 0;

      const curr = mappa.get(ruolo) || { conteggio: 0, spesaMensile: 0 };
      mappa.set(ruolo, {
        conteggio: curr.conteggio + 1,
        spesaMensile: curr.spesaMensile + stipendio
      });
    });

    return Array.from(mappa.entries()).map(([ruolo, dati]) => {
      const spesaAnnualeNetta = dati.spesaMensile * this.MENSILITA;
      const costoAnnualeAzienda = dati.spesaMensile * this.MOLTIPLICATORE_LORDO * this.MOLTIPLICATORE_COSTO_AZIENDA * this.MENSILITA;
      const percentuale = totaleNettoG > 0 ? (dati.spesaMensile / totaleNettoG) * 100 : 0;

      return {
        ruolo,
        conteggio: dati.conteggio,
        spesaMensileNetta: dati.spesaMensile,
        spesaAnnualeNetta,
        costoAnnualeAzienda,
        percentuale
      };
    });
  });
}