import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaForm } from './receita-form';

describe('ReceitaForm', () => {
  let component: ReceitaForm;
  let fixture: ComponentFixture<ReceitaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceitaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
