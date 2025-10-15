import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private key = 'autenticacion';

  constructor() { }

  guardarUsuario(usuario: any): void {
    sessionStorage.setItem(this.key, JSON.stringify(usuario));
  }

  obtenerUsuario(): any | null {
    const datos = sessionStorage.getItem(this.key);    
    return datos ? JSON.parse(datos) : null;
  }
}
