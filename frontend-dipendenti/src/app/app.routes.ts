import { Routes } from '@angular/router';
import { Stats } from './stats/stats';
import { ListaDipendentiComponent } from './lista-dipendenti/lista-dipendenti';

export const routes: Routes = [
   // Rotta di default (reindirizza alla lista dipendenti quando apri l'app)
  { path: '', redirectTo: 'dipendenti', pathMatch: 'full' }, 
  
  // Le tue rotte
  { path: 'dipendenti', component: ListaDipendentiComponent },
  { path: 'stats', component: Stats }
];
