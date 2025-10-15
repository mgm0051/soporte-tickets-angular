import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../login.service';
import axios from 'axios';

@Component({
  selector: 'app-consultas',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './consultas.component.html',
  styleUrl: './consultas.component.css'
})
export class ConsultasComponent {

  especialRolUsuario: string = '';

  usuarioLoguead = 0;

  nuevaConsulta: FormGroup;

  consultaCreada: boolean = false;

  consultaEditada: FormGroup;

  ensenaModal: boolean = false;

  showModal: boolean = false;

  busquedaTexto: string = '';

  busquedaTextoo: string = '';

  consulta: any[] = [];
  usuarios: any[] = [];

  selectedConsultaId : any;

  constructor(private loginService: LoginService, private router: Router){
    
    this.nuevaConsulta = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$')]),
      usuario: new FormControl(''),
    });

    this.consultaEditada = new FormGroup({
      nombre: new FormControl( '', [Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$')]),
      usuario: new FormControl( ''),
    });
  }

  ngAfterViewInit(): void {
    const usuario = this.loginService.obtenerUsuario().id;
    if (usuario) {
      this.usuarioLoguead = usuario;
      this.getConsultasUsu(this.usuarioLoguead);
      console.log('Usuario recuperado del sessionStorage:', usuario);
    }
  }

  ngOnInit(): void {

    this.getTodasLasConsultas()

    this.getConsultasUsu(this.usuarioLoguead)

    this.getUsuario(this.usuarioLoguead)

    const usuarioBan = sessionStorage.getItem('usuario');
    if (usuarioBan) {
      const usuario = JSON.parse(usuarioBan);
      this.usuarioLoguead = usuario.id;
      this.verificarBanUsuario(usuario.id);
      this.getUsuario(usuario.id);
    }
  }

  get consultasFiltradas() {
    return this.consulta.filter(consultas => {
      const texto = this.busquedaTexto.toLowerCase();
      return (
        consultas.nombre.toLowerCase().includes(texto)
      );
  });
}

get consultaFiltrada() {
    return this.consulta.filter(consultass => {
      const texto = this.busquedaTextoo.toLowerCase().trim();
      return (
        consultass.nombre.toLowerCase().includes(texto) ||
        consultass.usuario?.some((usuario: any) => usuario.nombre.toLowerCase().includes(texto))
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

  async getTodasLasConsultas() {
    try {
      const response = await axios.get('http://localhost:3000/consulta');
      this.consulta = response.data;
      console.log('Todas las consultas:', this.consulta);
    } catch (error) {
        console.error('Error al obtener todas las consultas:', error);
      }
  }

  async getConsultasUsu(id: number) {
    try {
      if (this.especialRolUsuario === 'Admin') {
        const response = await axios.get('http://localhost:3000/consulta');
        this.consulta = response.data;
        console.log('Todas las consultas (Admin):', this.consulta);
      } else {
          const response = await axios.get(`http://localhost:3000/consulta/usuarioRelacion/${id}`);

          this.consulta = response.data;

          console.log('Consultas del usuario logueado:', this.consulta);
        }
    } catch (error) {
        console.error('Error al obtener las consultas:', error);
      }
  }

  createConsulta(){
    axios.post('http://localhost:3000/consulta', this.nuevaConsulta.value)
    .then(response => {
      this.showModal = false;
        this.consulta.push(response.data);
        this.consultaCreada = true
        response.data = false;
        console.log(this.nuevaConsulta.value);
        this.nuevaConsulta.reset()
      })
      .catch(creada => {
        this.consultaCreada = true
        creada.response.data.message
        console.log(creada)
      })
  }

  openCrearModal() {
    this.nuevaConsulta.setValue({
      nombre: '',
      usuario: ''
    });
  this.showModal = true;
  console.log(this.showModal)
  }

closeModal(event: any) {
  if (event.target === event.currentTarget) {
    this.showModal = false;
  }
}

  deleteConsultas(id: number){
    this.consulta = this.consulta.filter(item => item.id !== id);
    axios.delete(`http://localhost:3000/consulta/${id}`)
        .then((response) => {
          console.log('Consulta eliminada:', response.data);
        })
  }

  confirmarEliminacion(id: number): void {
    const confirmado = window.confirm('¿Estás seguro de que deseas eliminar esta consulta?');

  if (confirmado) {
    this.deleteConsultas(id);
  } else {
    }
}

  updateConsulta() {
    if (this.consultaEditada.valid) {
      console.log(this.consultaEditada.value);
      this.consultaEditada.value.usuario=this.consultaEditada.value.usuario.map((val:any)=>{return {id:val}})
      const updateConsulta = { ...this.consultaEditada.value };
      axios.patch(`http://localhost:3000/consulta/${this.selectedConsultaId}`, updateConsulta)
        .then(response => {
          console.log('consulta actualizada:', response.data);
          this.ensenaModal = false;
          this.getConsultasUsu(this.usuarioLoguead);
        });
    }
  }
  openConsulta(consulta: any) {
    if (this.especialRolUsuario === 'Admin') {
      this.selectedConsultaId = consulta.id;
      const usuariosIds = consulta.usuario.map((u: any) => u.id);
      this.consultaEditada.setValue({
        nombre: consulta.nombre,
        usuario: usuariosIds
      });
      this.ensenaModal = true;
    }
  }

  closeeModaal(event: any) {
    if (event.target === event.currentTarget) {
      this.ensenaModal = false;
    }
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
      this.getConsultasUsu(this.usuarioLoguead);
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

  trackById(index: number, item: any): number {
    return item.id;
  }

}
