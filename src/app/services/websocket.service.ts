import { Injectable } from '@angular/core';
// import { Socket } from 'ngx-socket-io';
import * as io from 'socket.io-client';
// import { Usuario } from '../models/usuario';
// import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
    // Singleton
    private static instance: WebsocketService;

    public static SOCKET_STATUS = false;
    public static URL: string;

    private socket;

//  public usuario: Usuario = null;

    constructor(urlVal?: string) {
        if (environment.debug) {
            console.log('WebSocket constructor: ', urlVal);
        }
        this.URL = urlVal;
        this.socket = io(this.URL);
        this.checkStatus();
        // this.cargarStorage();
        // this.checkStatus();
    }

    // Singleton
    public static getInstance(urlVal?: string) {
        if (environment.debug) {
            console.log('getInstance: ', urlVal);
        }
        if (urlVal) {
            return this.instance || (this.instance = new this(urlVal));
        } else {
            return null;
        }
    }

  checkStatus() {
    this.socket.on('connect', () => {
        WebsocketService.SOCKET_STATUS = true;
        // this.cargarStorage();
        if (environment.debug) {
            console.log('on connect: ', WebsocketService.SOCKET_STATUS);
        }
    });

    this.socket.on('disconnect', () => {
        WebsocketService.SOCKET_STATUS = false;

        if (environment.debug) {
            console.log('on disconnect: ', WebsocketService.SOCKET_STATUS);
        }
    });
  }

  // tslint:disable-next-line: ban-types
  emit(evento: string, payload?: any, callback?: Function) {

    console.log(`Emitiendo: ${evento}`);

    this.socket.emit(evento, payload, callback);
  }

  listen(evento: string) {
    return this.socket.fromEvent(evento);
  }

  emitServerInfo() {
    return this.emit('get-server');
  }

  getServerInfo() {
    return this.listen('server-info');
  }

  emitirUsuariosActivos() {
    console.log('Emitir obtener usuarios');
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
