import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalService } from './local.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainService {

    localIp = '';
    serverURL = '';

  constructor(
    private http: HttpClient,
    private localService: LocalService
    ) {
        this.localService.getStorage('SERVER_IP')
        .then(ip => {
            this.localIp = ip;
            this.serverURL = `http://${this.localIp}:${environment.api_port}`;
        });
    }

  loginUser(user: string, pass: string) {
    const params = {
        username: user,
        password: pass
    };

    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json'
        })
    };

    return this.http.post(`${this.serverURL}/api/v1/rest-auth/login/`, params, httpOptions).toPromise();
  }

  logoutUser(token: string) {

    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json',
            Authorization: `Token ${token}`
        })
    };

    return this.http.post(`${this.serverURL}/api/v1/rest-auth/logout/`, {}, httpOptions).toPromise();
  }
}
