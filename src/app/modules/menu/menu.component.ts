import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  especialRolUsuario: string = '';

  isban: boolean = false;

  usuarioLoguead = 0;

  usuarios: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {

    this.getUsuario(this.usuarioLoguead);

    const usuarioBan = sessionStorage.getItem('usuario');
    if (usuarioBan) {
      const usuario = JSON.parse(usuarioBan);
      this.usuarioLoguead = usuario.id;
      this.verificarBanUsuario(usuario.id);
      this.getUsuario(usuario.id);
    }
  }

  obtenerUsuarioDesdeStorage(): any {
    const usuarioData = sessionStorage.getItem('usuario');
    return usuarioData ? JSON.parse(usuarioData) : null;
  }

  verificarBanUsuario(usuarioId: number): void {
    fetch(`http://localhost:3000/usuarios/${usuarioId}`)
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

  getUsuario(id: number) {
    fetch(`http://localhost:3000/usuarios/${id}`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data.especialrol) && data.especialrol.length > 0) {
        this.especialRolUsuario = data.especialrol[0].nombre;
      } else {
        this.especialRolUsuario = 'Usuario';
      }
      axios.get('http://localhost:3000/usuarios')
        .then((response) => {
          const usuarios = response.data;
          this.usuarios = this.especialRolUsuario === 'Admin'
            ? usuarios
            : usuarios.filter((u: any) => u.id === id);
        })
        .catch(error => {
          console.error('Error al obtener usuarios:', error);
        });
    })
    .catch(error => {
      console.error('Error al obtener especialrol:', error);
    });
}

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['login']);
    window.location.reload();
  }

  confirmarLogout(): void {
    const confirmado = window.confirm('¿Estás seguro de que deseas cerrar sesion?');

  if (confirmado) {
    this.logout();
  } else {
    }
  }
}


