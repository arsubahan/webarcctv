import { TestBed } from '@angular/core/testing';

import { ArcctvService } from './arcctv.service';

describe('ArcctvService', () => {
  let service: ArcctvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArcctvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
