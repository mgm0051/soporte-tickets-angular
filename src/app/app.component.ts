import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { LoginComponent } from './modules/login/login.component';
import { MenuComponent } from './modules/menu/menu.component';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule, ReactiveFormsModule,  LoginComponent, MenuComponent, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title: any;
  isLoggedIn = false;
  nothome = false;

  usuarioLoguead = 0

  constructor(private router: Router) {}

  ngOnInit(): void {
  this.isLoggedIn = !!sessionStorage.getItem('isLoggedIn');
  if (!this.isLoggedIn) {
    this.router.navigate(['/login']);
  }
  this.router.events.subscribe(val=>{if(val instanceof NavigationEnd){
    if(val.url!='/' && val.url!=''){
      this.nothome=true
    }else{
      this.nothome=false
    }
  }});

const usuarioBan = sessionStorage.getItem('usuario');

  if (usuarioBan) {
    const usuario = JSON.parse(usuarioBan);

    fetch(`http://localhost:3000/usuarios/${usuario.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.isban) {
          alert('Tu cuenta ha sido baneada.');
          this.logout();
        } else {
          this.usuarioLoguead = data.id;
        }
      })
      .catch(error => {
        console.error('Error al verificar usuario:', error);
        this.logout();
      });
  }
}

  logout(): void {
  sessionStorage.clear();
  this.router.navigate(['login']);
  window.location.reload();
  }

  onLoginSuccess(): void {
    this.isLoggedIn = true;
    sessionStorage.setItem('isLoggedIn', 'true');
    this.router.navigate(['/']);
  }

  subir(){
    window.scrollTo({top:0, behavior: 'smooth'})
  }
}



