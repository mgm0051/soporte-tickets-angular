import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})

export class AnadirComponent implements OnInit {

  especialRolUsuario: string = '';

  usuarioLoguead = 0;

  nuevoUsuario: FormGroup;

  usuarioEditado: FormGroup;

  usuarioCreado: boolean = false;

  showModal: boolean = false;

  showwModal: boolean = false;

  emailError: boolean = false;

  passwordVisible: boolean = false;

  confirmPasswordVisible: boolean = false;

  selectedFile: File | null = null;

  uploadedImageUrl: string = ''; 

  busquedaTexto: string = '';

  usuarios: any[] = [];
  roles: any[] = [];
  especial_rol: any[] = [];
  
  constructor (private router: Router) {
  
    this.nuevoUsuario = new FormGroup({
      nombre: new FormControl( '', [Validators.required, Validators.pattern('^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\\s,\\.]*$')]),
      email : new FormControl( '', [Validators.required, Validators.email]),
      contacto : new FormControl( '', [Validators.required, Validators.pattern('^[0-9]{9}$')]),
      password : new FormControl( '', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\\.)[A-Za-z0-9!@#$%^&*(),.?":{}|<>_-]{8,}$')]),
      confirmPassword: new FormControl('', Validators.required),
      imagenPerfilurl : new FormControl( '', Validators.required),
      isban: new FormControl(false, Validators.required),
      roles: new FormControl(''),
      especialrol: new FormControl('')
    }, this.passwordsMatch);

    this.usuarioEditado = new FormGroup({
      nombre: new FormControl( '', [Validators.required, Validators.pattern('^[A-Z][a-z0-9\\s]*$')]),
      email : new FormControl( '', [Validators.required, Validators.email]),
      contacto : new FormControl( '', [Validators.required, Validators.pattern('^[0-9]{9}$')]),
      password : new FormControl( ''),
      imagenPerfilurl : new FormControl( '', Validators.required),
      isban: new FormControl(false, Validators.required),
      roles: new FormControl(''),
      especialrol: new FormControl('')
    });
}

ngOnInit(): void {

  this.getUsuario(this.usuarioLoguead);

  this.getRoles();

  this.getEspecialRol();

  const usuarioBan = sessionStorage.getItem('usuario');
  if (usuarioBan) {
    const usuario = JSON.parse(usuarioBan);
    this.usuarioLoguead = usuario.id;
    this.verificarBanUsuario(usuario.id);
    this.getUsuario(usuario.id);
  }
}

get usuariosFiltrados() {
  const texto = this.busquedaTexto.toLowerCase().trim();

  return this.usuarios.filter(usuario => {
    return (
      usuario.nombre.toLowerCase().includes(texto) ||
      usuario.email.toLowerCase().includes(texto) ||
      usuario.contacto.toLowerCase().includes(texto) ||
      String(usuario.isban).toLowerCase().includes(texto) ||
      usuario.roles?.some((role: any) => role.nombre.toLowerCase().includes(texto)) ||
      usuario.especialrol?.some((especial: any) => especial.nombre.toLowerCase().includes (texto))
    )
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

passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const group = control as FormGroup;
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsDoNotMatch: true };
}

togglePasswordVisibility(): void {
  this.passwordVisible = !this.passwordVisible;
}

toggleConfirmPasswordVisibility(): void {
  this.confirmPasswordVisible = !this.confirmPasswordVisible;
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

          if (this.especialRolUsuario === 'Admin') {
            this.usuarios = usuarios;
          } else {
            this.usuarios = usuarios.filter((u: any) => u.id === id);
          }

          console.log('Usuarios cargados:', this.usuarios);
        })
        .catch(error => {
          console.error('Error al obtener usuarios:', error);
        });
      console.log('Especial Rol obtenido:', this.especialRolUsuario);
    })
    .catch(error => {
      console.error('Error al obtener especialrol:', error);
    });
}

async createUsuario(){
  try {
    let imageUrl = '';
      if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const response = await fetch('http://localhost:3000/usuarios/imagenes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const result = await response.json();
      imageUrl = `http://localhost:3000/imagenes/${result.filename}`;
      this.uploadedImageUrl = imageUrl;
      }
  const usuarioData = {
      ...this.nuevoUsuario.value, imagenPerfilurl: imageUrl,
    };
  console.log(usuarioData)
  axios.post('http://localhost:3000/usuarios', usuarioData)
  .then(response => {
      console.log('Usuario creado:', response.data);
      this.usuarios.push(response.data);
      this.usuarioCreado = true;
      response.data.isban = false;
      this.showwModal = false;
      this.nuevoUsuario.reset();
      this.selectedFile = null;
      this.uploadedImageUrl = '';
  })
    .catch(error => {
      this.emailError = true;
      console.error('Error al crear usuario:', error);
    });

  } catch (err) {
      console.error(err);
      alert('Error al crear el usuario o subir imagen');
  }
}

async actuUsuario() {
  if (this.usuarioEditado.valid) {
    try {
      let imageUrl = this.usuarioEditado.value.imagenPerfilurl || '';

      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        const response = await fetch('http://localhost:3000/usuarios/imagenes', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Error al subir imagen');

        const result = await response.json();
        imageUrl = `http://localhost:3000/imagenes/${result.filename}`;
      }

      const actuUsuario = {
        ...this.usuarioEditado.value,
        imagenPerfilurl: imageUrl
      };

      const res = await axios.patch(`http://localhost:3000/usuarios/${actuUsuario.email}`, actuUsuario);

      console.log('Usuario actualizado:', res.data);
      this.showModal = false;
      this.selectedFile = null;
      this.uploadedImageUrl = '';
      this.getUsuario(this.usuarioLoguead);

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      alert('Error al actualizar el usuario o subir imagen');
    }
  }
}

openCrearModal(usuarioo: any = { isban: false, roles: [], especialrol: '' }) {
  this.nuevoUsuario.setValue({
    nombre: '',
    email: '',
    contacto: '',
    password: '',
    confirmPassword: '',
    imagenPerfilurl: '',
    isban: usuarioo.isban,
    roles: usuarioo.roles,
    especialrol: usuarioo.especialrol
  });
  this.showwModal = true;
  console.log(this.showwModal)
}

openEditModal(usuario: any) {
  this.usuarioEditado.setValue({
    nombre: usuario.nombre,
    email: usuario.email,
    contacto: usuario.contacto,
    password: usuario.password,
    imagenPerfilurl: usuario.imagenPerfilurl,
    isban: usuario.isban,
    roles: usuario.roles,
    especialrol: usuario.especialrol
  });
  this.showModal = true;
  console.log(this.showModal)
}

closeModal(event: any) {
  if (event.target === event.currentTarget) {
    this.showModal = false;
  }
}

closeeModal(event: any) {
  if (event.target === event.currentTarget) {
    this.showwModal = false;
  }
}

deleteUsuario(email: string) {
  this.usuarios = this.usuarios.filter(item => item.email !== email);
  axios.delete(`http://localhost:3000/usuarios/${email}`)
      .then((response) => {
        console.log('Usuario eliminado:', response.data);
      })
}

confirmarEliminacion(email: string): void {
  const confirmado = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');

  if (confirmado) {
    this.deleteUsuario(email);
  } else {
  }
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

trackById(index: number, item: any): number {
  return item.id;
}

}





