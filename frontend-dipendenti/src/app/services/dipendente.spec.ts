import { TestBed } from '@angular/core/testing';

import { Dipendente } from './dipendente';

describe('Dipendente', () => {
  let service: Dipendente;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dipendente);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
