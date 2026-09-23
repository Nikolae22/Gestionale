import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroDipendenti } from './filtro-dipendenti';

describe('FiltroDipendenti', () => {
  let component: FiltroDipendenti;
  let fixture: ComponentFixture<FiltroDipendenti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroDipendenti],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltroDipendenti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
