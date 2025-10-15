import { Component, OnInit } from '@angular/core';
import { AnadirComponent } from '../usuarios/usuario.component';
import { TicketsComponent } from '../tickets/tickets.component';
import { ConsultasComponent } from '../consultas/consultas.component';
import { RolesComponent } from '../roles/roles.component';
import { RolesEspecialesComponent } from '../roles-especiales/roles-especiales.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ RolesEspecialesComponent, RolesComponent, ConsultasComponent, TicketsComponent, AnadirComponent ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  isLoggedIn = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
  this.isLoggedIn = !!sessionStorage.getItem('isLoggedIn');
  if (!this.isLoggedIn) {
    this.router.navigate(['/login']);
  }
}

  onLoginSuccess(): void {
    this.isLoggedIn = true;
    sessionStorage.setItem('isLoggedIn', 'true');
    this.router.navigate(['/home']);
  }

  subir(){
    window.scrollTo({top:0, behavior: 'smooth'})
  }
}
