import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FiltroDipendentiEvent {
  ruolo: string | null;
  stipendio: number | null;
}

@Component({
  selector: 'app-filtro-dipendenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-dipendenti.html',
  styleUrl: './filtro-dipendenti.css'
})
export class FiltroDipendentiComponent {
  // Input Signal dal componente padre
  ruoli = input<string[]>([]);

  // Output Signals per gli eventi
  cerca = output<FiltroDipendentiEvent>();
  cercaEmail=output<string>()
  reset = output<void>();

  // Writable Signals per lo stato interno
  filtroEmail=signal<string>('')
  filtroRuolo = signal<string>('');
  filtroStipendio = signal<number | null>(null);
  isFiltrato = signal<boolean>(false);

  // Computed Signal: si aggiorna in automatico quando cambiano i filtri
  canSearch = computed(() => {
    const ruoloVal = this.filtroRuolo().trim();
    const stipendioVal = this.filtroStipendio();
    return ruoloVal !== '' || (stipendioVal !== null && stipendioVal !== undefined);
  });

  onCercaEmail():void{
    const email=this.filtroEmail().trim();
    if(!email) return;

    this.isFiltrato.set(true);
    this.cercaEmail.emit(email);
  }

  onCerca(): void {
    if (!this.canSearch()) return;

    this.isFiltrato.set(true);
    this.cerca.emit({
      ruolo: this.filtroRuolo() || null,
      stipendio: this.filtroStipendio()
    });
  }

  onReset(): void {
    this.filtroRuolo.set('');
    this.filtroEmail.set('')
    this.filtroStipendio.set(null);
    this.isFiltrato.set(false);
    this.reset.emit();
  }
}