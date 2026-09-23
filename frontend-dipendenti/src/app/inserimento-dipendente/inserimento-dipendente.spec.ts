import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InserimentoDipendente } from './inserimento-dipendente';

describe('InserimentoDipendente', () => {
  let component: InserimentoDipendente;
  let fixture: ComponentFixture<InserimentoDipendente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InserimentoDipendente],
    }).compileComponents();

    fixture = TestBed.createComponent(InserimentoDipendente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
