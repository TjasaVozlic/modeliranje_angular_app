import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnsembleComponent } from './ensemble.component';

describe('EnsembleComponent', () => {
  let component: EnsembleComponent;
  let fixture: ComponentFixture<EnsembleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnsembleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnsembleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
