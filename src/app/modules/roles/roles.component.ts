import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-roles',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent {

  especialRolUsuario: string = '';

  usuarioLoguead = 0;

  nuevoRol: FormGroup;

  rolCreado: boolean = false;

  showModal: boolean = false;

  busquedaTexto: string = '';

  roles: any[] = [];
  usuarios: any[] = [];

  constructor(private router: Router){

    this.nuevoRol = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$')])
    })
    
  }

  ngOnInit(): void {

    this.getUsuario(this.usuarioLoguead)

    this.getRoles()

    const usuarioBan = sessionStorage.getItem('usuario');
    if (usuarioBan) {
      const usuario = JSON.parse(usuarioBan);
      this.usuarioLoguead = usuario.id;
      this.verificarBanUsuario(usuario.id);
      this.getUsuario(usuario.id);
    }
  }

  get rolesFiltrados() {
    return this.roles.filter(rol => {
      const texto = this.busquedaTexto.toLowerCase();
      return (
        rol.nombre.toLowerCase().includes(texto)
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

  getRoles(){
    axios.get('http://localhost:3000/roles')
      .then((response) => {
        console.log('Datos roles:', response.data);
        this.roles = response.data;
        console.log(this.roles)
      })
  }

  createRoles(){
    axios.post('http://localhost:3000/roles', this.nuevoRol.value)
    .then(response => {
        this.roles.push(response.data);
        this.showModal = false;
        this.rolCreado = true
        response.data = false;
        this.nuevoRol.reset()
      })
      .catch(crearol => {
        this.rolCreado = true
        crearol.response.data.message
        console.log(crearol)
      })
  }

  openCrearModal() {
  this.nuevoRol.setValue({
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

  deleteRoles(id: number){
    this.roles = this.roles.filter(item => item.id !== id);
    axios.delete(`http://localhost:3000/roles/${id}`)
        .then((response) => {
          console.log('Rol eliminado:', response.data);
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
      this.getRoles();
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
    const confirmado = window.confirm('¿Estás seguro de que deseas eliminar este rol?');

  if (confirmado) {
    this.deleteRoles(id);
  } else {
  }
}

  trackById(index: number, item: any): number {
    return item.id;
  }

}
