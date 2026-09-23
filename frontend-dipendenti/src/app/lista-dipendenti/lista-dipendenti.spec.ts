import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDipendenti } from './lista-dipendenti';

describe('ListaDipendenti', () => {
  let component: ListaDipendenti;
  let fixture: ComponentFixture<ListaDipendenti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDipendenti],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaDipendenti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
