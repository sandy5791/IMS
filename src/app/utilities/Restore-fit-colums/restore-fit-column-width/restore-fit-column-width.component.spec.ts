import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreFitColumnWidthComponent } from './restore-fit-column-width.component';

describe('RestoreFitColumnWidthComponent', () => {
  let component: RestoreFitColumnWidthComponent;
  let fixture: ComponentFixture<RestoreFitColumnWidthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestoreFitColumnWidthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestoreFitColumnWidthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
