import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import axios from 'axios';
import { LoginService } from '/sicnova/angular/src/app/login.service'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit {

  @Output() loginExitoso = new EventEmitter<any>();

  usuarioLoguead = 0;

  login: FormGroup;

  loginMessage: string = '';

  passwordVisible: boolean = false;

  usuarios: any[] = [];
  tickets: any[] = [];
  mensajes: any[] = [];
  consulta: any[] = [];
  roles: any[] = [];
  especial_rol: any[] = [];

  constructor(private loginService: LoginService, private router: Router) {

    this.login = new FormGroup({
      email: new FormControl( '', Validators.required),
      password : new FormControl( '', Validators.required)
    });
  }

  ngAfterViewInit(): void {
    const usuario = this.loginService.obtenerUsuario();
    if (usuario) {
      this.usuarioLoguead = usuario.id;
      this.loginMessage = 'Ya estás logueado';
      this.loginExitoso.emit(usuario);
      console.log('Usuario recuperado del sessionStorage:', usuario);
    }
  }

  async loginUsuario(email: string, password: string): Promise<void> {
    try {
      const response = await axios.post('http://localhost:3000/usuarios/validar', {
        email: email,
        password: password
      });
      if (response.data) {
        sessionStorage.setItem('usuario', JSON.stringify(response.data));
        if (response.data.isban) {
          this.loginMessage = 'No tienes acceso';
          console.log('Este usuario no tiene acceso')
          return;
        }
        this.usuarioLoguead = response.data.id;

        this.loginService.guardarUsuario(response.data);

        this.loginExitoso.emit(response.data);

        this.getTicketsUsu(this.usuarioLoguead);
        this.getUsuario();
        this.getMensajes()
        this.getConsultas()
        this.getRoles() 
        this.getEspecialRol()

        this.loginMessage = 'Inicio de sesión correcto';
        console.log('Usuario encontrado:', this.usuarios);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
            this.loginMessage = 'Usuario no encontrado';
            this.loginMessage = 'Email o Contraseña incorrectos';
          }
        }
      }

  async getLogin(): Promise<void> {
    const { email, password } = this.login.value;
    await this.loginUsuario(email, password);
  }

    getUsuario() {
    axios.get('http://localhost:3000/usuarios')
      .then((response) => {
        console.log('Datos usuarios:', response.data);
        this.usuarios = response.data;
        console.log(this.usuarios)
      });
  }

getTicketsUsu(id: number) {
    axios.get(`http://localhost:3000/tickets/usuarioRelacion/${id}`)
      .then((response) => {
        const ticketsUsuarioLogueado = response.data.filter((ticket: any) => 
          (ticket.usuario && ticket.usuario.id === this.usuarioLoguead) || 
          (ticket.usuariooCreador && ticket.usuariooCreador.id === this.usuarioLoguead) || 
          Array.isArray(ticket.consultas.usuario) && ticket.consultas.usuario.some((usuario: any) => usuario.id === this.usuarioLoguead))
        console.log('Tickets del usuario logueado:', ticketsUsuarioLogueado);
        this.tickets = ticketsUsuarioLogueado;
      })
      .catch((error) => {
        console.error('Error al obtener los tickets:', error);
      });
  }

    getMensajes(){
    axios.get('http://localhost:3000/mensajes')
      .then((response) => {
        console.log('Datos mensajes:', response.data);
        this.mensajes = response.data;
        console.log(this.mensajes)
      })
  }

  getConsultas(){
    axios.get('http://localhost:3000/consulta')
      .then((response) => {
        console.log('Datos consulta:', response.data);
        this.consulta = response.data;
        console.log(this.consulta)
      })
  }

  getRoles(){
    axios.get('http://localhost:3000/roles')
      .then((response) => {
        console.log('Datos roles:', response.data);
        this.roles = response.data;
        console.log(this.roles)
      })
  }

  getEspecialRol(){
    axios.get('http://localhost:3000/especial-rol')
      .then((response) => {
        console.log('Datos especialRol:', response.data);
        this.especial_rol = response.data;
        console.log(this.especial_rol)
      })
  }

  onLoginSuccess(event: Event): void {
    this.loginExitoso.emit(event);
  }

}

