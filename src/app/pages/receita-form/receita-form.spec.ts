import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceitaFormComponent } from './receita-form';

describe('ReceitaForm', () => {
  let component: ReceitaFormComponent;
  let fixture: ComponentFixture<ReceitaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceitaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceitaFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
