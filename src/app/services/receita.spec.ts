import { TestBed } from '@angular/core/testing';

import { Receita } from './receita';

describe('Receita', () => {
  let service: Receita;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Receita);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
