import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(
        public wsService: WebsocketService,
        private http: HttpClient) { }

  emitServerInfo() {
    return this.wsService.emit('get-server');
  }

  getServerInfo() {
    return this.wsService.listen('server-info');
  }

  emitirUsuariosActivos() {
    console.log('Emitir obtener usuarios');
    return this.wsService.emit('obtener-usuarios');
  }

  loginUser(user: string, pass: string) {
    const params = {
        username: user,
        password: pass
    };

    console.log(params);

    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json'
        })
    };

    return this.http.post('http://localhost:8000/api/v1/rest-auth/login/', params, httpOptions).toPromise();
  }
}
