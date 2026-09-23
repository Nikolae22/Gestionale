import { Dipendente, PageResponse } from './../models/dipendente.model';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DipendenteService {
  
  private http = inject(HttpClient);
  // Assicurati che l'URL coincida con il @RequestMapping del tuo Spring Boot
  private baseUrl = 'http://localhost:8081/crudDipendente';

  // GET: Trova tutti
  // findAllDipendenti(): Observable<Dipendente[]> {
  //   return this.http.get<Dipendente[]>(`${this.baseUrl}/findAllDipedenti`);
  // }
 findAllDipendenti(page: number = 0, size: number = 10): Observable<PageResponse<Dipendente>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<PageResponse<Dipendente>>(`${this.baseUrl}/findAllDipedenti`, { params });
}

  // DELETE: Elimina tramite body
  // deleteDipendenteByCf(cf: string): Observable<any> {
  //   return this.http.request('delete', `${this.baseUrl}/deleteDipendenteByCodiceFiscale`, {
  //     body: { codice_fiscale: cf }
  //   });
  // }

  // POST: Inserisci Dipendente e Account assieme
  insertDipendente(dipendente: Partial<Dipendente>): Observable<Dipendente> {
  return this.http.post<Dipendente>(`${this.baseUrl}/create`, dipendente);
}

updateDipendente(dipendente: Partial<Dipendente>): Observable<Dipendente>{
  return this.http.patch<Dipendente>(`${this.baseUrl}/update`,dipendente)
}

findDipendentiByRuoloAndStipendio(ruolo?: string | null, stipendio?: number | null): Observable<Dipendente[]> {
    let params = new HttpParams();
    if (ruolo && ruolo.trim() !== '') {
      params = params.set('ruolo', ruolo);
    }
    if (stipendio !== null && stipendio !== undefined) {
      params = params.set('stipendio', stipendio.toString());
    }
    return this.http.get<Dipendente[]>(`${this.baseUrl}/findDipendentiByRuoloAndStipendio`, { params });
  }

  // findByEmail(email: string): Observable<Dipendente> {
  // const params = new HttpParams().set('email', email);
  // return this.http.get<Dipendente>(`${this.baseUrl}/byemail`, { params });
  // }

  deleteDipendenteByCf(cf:string):Observable<String>{
    const params=new HttpParams().set('cf',cf);
    return this.http.delete(`${this.baseUrl}/delete`,{
      params,
      responseType: 'text'
    })
  }


  findByEmail(email: string, page: number = 0, size: number = 10): Observable<PageResponse<Dipendente>> {
  const params = new HttpParams()
    .set('email', email)
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<PageResponse<Dipendente>>(`${this.baseUrl}/email`, { params });
}
}