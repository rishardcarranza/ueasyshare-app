import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { UserSocket } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
    // Singleton
    private static instance: WebsocketService;

    public static SOCKET_STATUS = false;
    public static URL: string;
    public static IP: string;

    public socket: any;
    public users: UserSocket[];

    constructor(urlVal?: string) {
        WebsocketService.URL = urlVal;
        WebsocketService.IP = urlVal.substr(7);
        this.socket = io(WebsocketService.URL);

        if (environment.debug) {
            console.log('WebSocket constructor: ', urlVal, this.socket.connected);
        }
    }

    // Singleton
    public static getInstance(urlVal?: string) {
        if (urlVal) {
            return this.instance || (this.instance = new this(urlVal));
        } else {
            return null;
        }
    }

    public static destruct() {
        this.instance = null;
    }

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

  getUsuariosActivos() {
    this.socket.on('usuarios-activos', (response) => {
        // console.log('On usuarios activos', response);
        this.users = response;
    });

    return this.users;
  }

  emitirUsuariosActivos() {
    // console.log('Emitir obtener usuarios');
    return this.emit('obtener-usuarios');
  }

  emitirServerInfo() {
    // console.log('Emitir obtener usuarios');
    // return this.emit('obtener-usuarios');
  }
}
