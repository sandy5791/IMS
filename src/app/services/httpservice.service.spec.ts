import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { HttpserviceService } from './httpservice.service';

describe('HttpserviceService', () => {
  let service: HttpserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule], schemas: [NO_ERRORS_SCHEMA] });
    service = TestBed.inject(HttpserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
