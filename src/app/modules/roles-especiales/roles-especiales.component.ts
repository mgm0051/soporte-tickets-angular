import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-roles-especiales',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './roles-especiales.component.html',
  styleUrl: './roles-especiales.component.css'
})
export class RolesEspecialesComponent {

  especialRolUsuario: string = '';

  usuarioLoguead = 0;

  nuevoEspecialRol: FormGroup;

  especialRolcreado: boolean = false;

  showModal: boolean = false;

  busquedaTexto: string = '';

  especial_rol: any[] = [];
  usuarios: any[] = [];

  constructor(private router: Router){

    this.nuevoEspecialRol = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$')])
    })

  }

  ngOnInit(): void {

    this.getUsuario(this.usuarioLoguead)

    this.getEspecialRol()

    const usuarioBan = sessionStorage.getItem('usuario');
    if (usuarioBan) {
      const usuario = JSON.parse(usuarioBan);
      this.usuarioLoguead = usuario.id;
      this.verificarBanUsuario(usuario.id);
      this.getUsuario(usuario.id);
    }
  }

  get rolesEspecialesFiltrados() {
    return this.especial_rol.filter(rolespecial => {
      const texto = this.busquedaTexto.toLowerCase();
      return (
        rolespecial.nombre.toLowerCase().includes(texto)
      );
    });
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

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['login']);
    window.location.reload();
  }

  getEspecialRol(){
    axios.get('http://localhost:3000/especial-rol')
      .then((response) => {
        console.log('Datos especialRol:', response.data);
        this.especial_rol = response.data;
        console.log(this.especial_rol)
      })
  }

  createEspecialRol(){
    axios.post('http://localhost:3000/especial-rol', this.nuevoEspecialRol.value)
    .then(response => {
        this.especial_rol.push(response.data);
        this.showModal = false;
        this.especialRolcreado = true
        response.data = false;
        this.nuevoEspecialRol.reset()
      })
      .catch(creaespecialrol => {
        this.especialRolcreado = true
        creaespecialrol.response.data.message
        console.log(creaespecialrol)
      })
  }

  openCrearModal() {
  this.nuevoEspecialRol.setValue({
    nombre: ''
  });
  this.showModal = true;
  console.log(this.showModal)
}

closeModal(event: any) {
  if (event.target === event.currentTarget) {
    this.showModal = false;
  }
}

  deleteEspecialRol(id: number){
    this.especial_rol = this.especial_rol.filter(item => item.id !== id);
    axios.delete(`http://localhost:3000/especial-rol/${id}`)
        .then((response) => {
          console.log('Rol Especial eliminado:', response.data);
        })
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
      this.getEspecialRol();
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

  confirmarEliminacion(id: number): void {
  const confirmado = window.confirm('¿Estás seguro de que deseas eliminar este rol especial?');

  if (confirmado) {
    this.deleteEspecialRol(id);
  } else {
  }
}

  trackById(index: number, item: any): number {
    return item.id;
  }

}
