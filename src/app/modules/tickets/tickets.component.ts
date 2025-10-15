import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import axios from 'axios';
import { LoginService } from '../../login.service';
import { Router } from '@angular/router';

export function alMenosUnoSeleccionadoValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const usuarioId = control.get('usuarioId')?.value;
    const consultaId = control.get('consultaId')?.value;

    if (!usuarioId && !consultaId) {
      return { alMenosUnoRequerido: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-tickets',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css'
})

export class TicketsComponent {

  especialRolUsuario: string = '';

  usuarioLoguead = 0;

  nuevoTicket: FormGroup;

  ticketCreado: boolean = false;

  nuevoMensaje: FormGroup;

  mensajeCreado: boolean = false;

  abrirMensaje: FormGroup;

  verModal: boolean = false;

  showModal: boolean = false;

  title: any;
  usuarios: any[] = [];
  tickets: any[] = [];
  mensajes: any[] = [];
  consulta: any[] = [];

  ticketSeleccionado: any;

  selectedConsultaId : any;

  estadoTicket = '';

  selectedFile: File | null = null;

  uploadedImageUrl: string = ''; 

  busquedaTexto: string = '';

  constructor(private loginService: LoginService, private router: Router){

    this.nuevoTicket = new FormGroup({
      titulo: new FormControl( '', [Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$')]),
      descripcion : new FormControl( '', [Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$'), Validators.minLength(15)]),
      imagenUrl : new FormControl( ''),
      consultaId: new FormControl(''),
      usuarioId: new FormControl('')
    }, { validators: alMenosUnoSeleccionadoValidator() });

    this.abrirMensaje = new FormGroup({
      ref: new FormControl( ''),
      titulo: new FormControl( '', [Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$')]),
      descripcion : new FormControl( '', [Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$')]),
      mensajes: new FormControl(''),
      imagenUrl : new FormControl( ''),
      añadirMensaje: new FormControl('', [Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$')]),
    });

    this.nuevoMensaje = new FormGroup({
      texto: new FormControl('', [Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$'), Validators.minLength(15)]),
      imagenUrl: new FormControl(''),
      usuarioId: new FormControl('', Validators.required),
      ticketsId: new FormControl('', Validators.required)
    })
  }

  ngAfterViewInit(): void {
    const usuario = this.loginService.obtenerUsuario().id;
    if (usuario) {
      this.usuarioLoguead = usuario;
      this.getTicketsUsu(this.usuarioLoguead);
      console.log('Usuario recuperado del sessionStorage:', usuario);
    }
  }
  
ngOnInit(): void {

    this.getUsuario(this.usuarioLoguead);
  
    this.getMensajes();
  
    this.getTicketsUsu(this.usuarioLoguead);

    this.getConsultas();

  const usuarioBan = sessionStorage.getItem('usuario');
  if (usuarioBan) {
    const usuario = JSON.parse(usuarioBan);
    this.usuarioLoguead = usuario.id;
    this.verificarBanUsuario(usuario.id);
    this.getUsuario(usuario.id);
  }
}

get ticketsFiltrados() {
  const texto = this.busquedaTexto.toLowerCase().trim();

  return this.tickets.filter(ticket => {
    return (
      ticket.titulo.toLowerCase().includes(texto) ||
      String(ticket.ref).includes(texto) ||
      ticket.usuariooCreador?.nombre.toLowerCase().includes(texto) ||
      ticket.fechaInicio.toLowerCase().includes(texto) ||
      ticket.estado.toLowerCase().includes(texto) ||
      ticket.consultas?.nombre.toLowerCase().includes(texto) ||
      ticket.usuario?.nombre.toLowerCase().includes(texto)
    );
  });
}

obtenerUsuarioDesdeStorage(): any {
  const usuarioData = sessionStorage.getItem('usuario');
  return usuarioData ? JSON.parse(usuarioData) : null;
}

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
  }
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

  getTickets(){
    axios.get('http://localhost:3000/tickets')
    .then((response) => {
      console.log('Datos tickets:', response.data);
      this.tickets = response.data;
      console.log(this.tickets)
    })
  }

  getTicketsUsu(id: number) {
    if (this.especialRolUsuario === 'Admin') {
      axios.get('http://localhost:3000/tickets')
      .then((response) => {
        this.tickets = response.data;
        console.log('Todos los tickets (Admin):', this.tickets);
      })
      .catch((error) => {
        console.error('Error al obtener todos los tickets:', error);
      });
    } else {
        axios.get(`http://localhost:3000/tickets/usuarioRelacion/${id}`)
        .then((response) => {
          const ticketsUsuarioLogueado = response.data.filter((ticket: any) =>
            (ticket.usuario && ticket.usuario.id === this.usuarioLoguead) ||
            (ticket.usuariooCreador && ticket.usuariooCreador.id === this.usuarioLoguead) ||
            (Array.isArray(ticket.consultas?.usuario) && ticket.consultas.usuario.some((usuario: any) => usuario.id === this.usuarioLoguead))
          );
        this.tickets = ticketsUsuarioLogueado;
        console.log('Tickets del usuario logueado:', this.tickets);
        })
        .catch((error) => {
          console.error('Error al obtener los tickets:', error);
        });
      }
  }

  async createTickets(){
    try {
    let imageUrl = '';
      if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const response = await fetch('http://localhost:3000/tickets/imagenes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const result = await response.json();
      imageUrl = `http://localhost:3000/imagenes/${result.filename}`;
      this.uploadedImageUrl = imageUrl;
      }
    console.log(this.nuevoTicket.value)
    const ticketData = {
      ...this.nuevoTicket.value,
      usuarioCreador: this.usuarioLoguead,
      imagenUrl: imageUrl
  };
    axios.post('http://localhost:3000/tickets', ticketData)
    .then(response => {
        this.showModal = false;
        this.ticketCreado = true;
        response.data = false;
        this.nuevoTicket.reset();
        this.selectedFile = null;
        this.uploadedImageUrl = '';
        if(this.usuarioLoguead==0){
          this.getTickets()
        }else{
          this.getTicketsUsu(this.usuarioLoguead)
        }
      })
      .catch(creado => {
        this.ticketCreado = true
        creado.response.data.message
        console.log(creado)
      })
  } catch (err) {
      console.error(err);
      alert('Error al crear el usuario o subir imagen');
  }
}

  updateTickets() {
    if (this.abrirMensaje.valid) {
      const updateTickets = { ...this.abrirMensaje.value };
      axios.patch(`http://localhost:3000/tickets/${updateTickets.ref}`, updateTickets)
        .then(response => {
          console.log('ticket actualizado:', response.data);
          this.verModal = false;
          this.getTicketsUsu(this.usuarioLoguead)
        })
        .catch(error => {
          console.error('Error al actualizar el ticket:', error);
        });
    }
  }

  crearTicket() {
  this.nuevoTicket.setValue({
    titulo: '',
    descripcion: '',
    imagenUrl: '',
    consultaId: '',
    usuarioId: ''
  });
  this.showModal = true;
  console.log(this.showModal)
  }

  openMensaje(ref: number) {
      axios.get(`http://localhost:3000/tickets/${ref}`)
      .then((response) => {
        console.log('tickets:', response.data);
        this.ticketSeleccionado = response.data;
        console.log(response.data);
        this.abrirMensaje.setValue({
            ref: response.data.ref,
            titulo: response.data.titulo,
            descripcion: response.data.descripcion,
            mensajes: response.data.mensajes,
            imagenUrl: response.data.imagenUrl,
            añadirMensaje: ''
          });
          this.verModal = true;
      })
      .catch(error => {
        console.error('Error al obtener ticket:', error);
      });
  }
  
closeeModal(event: any) {
if (event.target === event.currentTarget) {
  this.verModal = false;
  }
}

closeModal(event: any) {
  if (event.target === event.currentTarget) {
  this.showModal = false;
  }
}

  cambiarEstado(ref: number, evento: any){
    axios.patch(`http://localhost:3000/tickets/${ref}/${evento.target.value}`)
    .then(response => {
      console.log('Ticket actualizado:', response.data);
      })
      this.tickets.forEach((ticketest: any)=> { if(ticketest.ref == ref) { ticketest.estado=evento.target.value}});
  }

  getMensajes(){
    axios.get('http://localhost:3000/mensajes')
      .then((response) => {
        console.log('Datos mensajes:', response.data);
        this.mensajes = response.data;
        console.log(this.mensajes)
      })
  }

  createMensajes(){
    console.log(this.nuevoMensaje.value)
    axios.post('http://localhost:3000/mensajes', this.nuevoMensaje.value)
    .then(response => {
      var usuarios = this.usuarios.find(item => item.id == response.data.usuarioId);
      var tickets = this.tickets.find(item => item.id == response.data.ticketsId);
        this.mensajes.push(response.data);
        var mensaje = this.mensajes.find(a => a.id == response.data.id)
        mensaje ["tickets"] = tickets;
        mensaje ["usuario"] = usuarios;
        this.mensajeCreado = true
        console.log(response.data)
        response.data = false;
        this.nuevoMensaje.reset()
      })
      .catch(creacion => {
        this.mensajeCreado = true
        creacion.response.data.message
        console.log(creacion)
      })
  }

  async crearMensaje() {
    try {
    let imageUrl = '';
      if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const response = await fetch('http://localhost:3000/mensajes/imagenes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const result = await response.json();
      imageUrl = `http://localhost:3000/imagenes/${result.filename}`;
      this.uploadedImageUrl = imageUrl;
      }
    const nuevoMensajeTexto = this.abrirMensaje.get('añadirMensaje')?.value?.trim();
    if (!nuevoMensajeTexto || !this.ticketSeleccionado.id) return;
    axios.get(`http://localhost:3000/tickets/${this.ticketSeleccionado.id}`)
      .then((response) => {
        const nuevoMensaje = {
          texto: nuevoMensajeTexto,
          imagenUrl: imageUrl,
          ticketsId: this.ticketSeleccionado.id,
          usuarioId: this.usuarioLoguead,
        };
        axios.post('http://localhost:3000/mensajes', nuevoMensaje)
          .then((response) => {
            console.log('Mensaje creado:', response.data);
            this.ticketSeleccionado.mensajes.push(response.data);
            this.mensajeCreado = true;
            this.abrirMensaje.get('añadirMensaje')?.reset();
            this.selectedFile = null;
            this.cambiarEstado(this.ticketSeleccionado.ref, { target: { value: 'in progress' } });
            console.log('Mensajes del ticket:', this.ticketSeleccionado.mensajes);
            this.openMensaje(this.ticketSeleccionado.ref);
          })
          .catch((error) => {
            this.mensajeCreado = false;
            console.error('Error al crear el mensaje:', error.response.data.message);
          });
        })
    } catch (err) {
      console.error(err);
      alert('Error al crear el usuario o subir imagen');
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
      this.getTicketsUsu(id);
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

getConsultas(){
  axios.get('http://localhost:3000/consulta')
    .then((response) => {
      console.log('Datos consulta:', response.data);
      this.consulta = response.data;
      console.log(this.consulta)
    })
}

trackById(index: number, item: any): number {
  return item.id;
}

}


