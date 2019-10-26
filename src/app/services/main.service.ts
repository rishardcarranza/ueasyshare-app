import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor( private http: HttpClient) { }

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

    return this.http.post('http://192.168.1.4:8000/api/v1/rest-auth/login/', params, httpOptions).toPromise();
  }

  logoutUser(token: string) {

    const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type':  'application/json',
            Authorization: `Token ${token}`
        })
    };

    return this.http.post('http://192.168.1.4:8000/api/v1/rest-auth/logout/', {}, httpOptions).toPromise();
  }
}
