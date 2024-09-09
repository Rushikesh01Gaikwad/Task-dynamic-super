import { TestBed } from '@angular/core/testing';

import { RoundValueService } from './round-value.service';

describe('RoundValueService', () => {
  let service: RoundValueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoundValueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
