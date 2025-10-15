import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesEspecialesComponent } from './roles-especiales.component';

describe('RolesEspecialesComponent', () => {
  let component: RolesEspecialesComponent;
  let fixture: ComponentFixture<RolesEspecialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesEspecialesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesEspecialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
