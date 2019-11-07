import { Injectable } from '@angular/core';
// import { Socket } from 'ngx-socket-io';
import * as io from 'socket.io-client';
// import { Usuario } from '../models/usuario';
// import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
    // Singleton
    private static instance: WebsocketService;

    public static SOCKET_STATUS = false;
    public static URL: string;
    public static IP: string;

    public socket;

//  public usuario: Usuario = null;

    constructor(urlVal?: string) {
        if (environment.debug) {
            console.log('WebSocket constructor: ', urlVal);
        }
        WebsocketService.URL = urlVal;
        WebsocketService.IP = urlVal.substr(7);
        this.socket = io(WebsocketService.URL);
        // this.checkStatus();
        // this.cargarStorage();
        // this.checkStatus();
    }

    // Singleton
    public static getInstance(urlVal?: string) {
        if (urlVal) {
            return this.instance || (this.instance = new this(urlVal));
        } else {
            return null;
        }
    }

//   checkStatus() {
//     return new Promise((resolve, rejected) => {
//         this.socket.on('connect', () => {
//             WebsocketService.SOCKET_STATUS = true;
//             // this.cargarStorage();
//             if (environment.debug) {
//                 console.log('on connect: ', WebsocketService.SOCKET_STATUS);
//             }
//         });

//         this.socket.on('disconnect', () => {
//             WebsocketService.SOCKET_STATUS = false;

//             if (environment.debug) {
//                 console.log('on disconnect: ', WebsocketService.SOCKET_STATUS);
//             }
//         });

//         resolve(WebsocketService.SOCKET_STATUS);
//     });
//   }

  // tslint:disable-next-line: ban-types
  emit(evento: string, payload?: any, callback?: Function) {

    console.log(`Emitiendo: ${evento}`);

    this.socket.emit(evento, payload, callback);
  }

  // tslint:disable-next-line: ban-types
//   listen(evento: string) {
//     // return this.socket.fromEvent(evento);
//     this.socket.on(evento, (callback) => {
//         return new Observable<any>(callback);
//     });
//   }

  emitServerInfo() {
    return this.emit('get-server');
  }

  getServerInfo() {
    let payload = null;
    this.socket.on('server-info', (callback) => {
        console.log('server-info', callback);
        payload = callback;
    });

    return payload;
  }

  emitirUsuariosActivos() {
    console.log('Emitir obtener usuarios');
    return this.emit('obtener-usuarios');
  }

  emitirServerInfo() {
    // console.log('Emitir obtener usuarios');
    return this.emit('obtener-usuarios');
  }

  // loginWS(nombre: string) {
  //   return new Promise((resolve, reject) => {
  //     this.emit('configurar-usuario', {nombre}, (resp) => {

  //       this.usuario = new Usuario(nombre);
  //       this.guardarStorage();

  //       resolve();
  //     });
  //   });
  // }

  // logoutWS() {
  //   this.usuario = null;
  //   localStorage.removeItem('usuario');

  //   const payload = {
  //     nombre: 'sin-nombre'
  //   };

  //   this.emit('configurar-usuario', payload, () => {});

  //   this.router.navigateByUrl('/');
  // }

  // getUsuario() {
  //   return this.usuario;
  // }

  // guardarStorage() {
  //   localStorage.setItem('usuario',  JSON.stringify(this.usuario));
  // }

  // cargarStorage() {
  //   if (localStorage.getItem('usuario')) {
  //     this.usuario = JSON.parse(localStorage.getItem('usuario'));
  //     this.loginWS(this.usuario.nombre);
  //   }
  // }
}
