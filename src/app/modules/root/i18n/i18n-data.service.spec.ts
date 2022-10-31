import { TestBed } from '@angular/core/testing';

import { I18nDataService } from './i18n-data.service';

describe('I18nDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: I18nDataService = TestBed.get(I18nDataService);
    expect(service).toBeTruthy();
  });
});
