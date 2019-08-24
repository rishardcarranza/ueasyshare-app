import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Menu } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class LocalService {

  constructor(private http: HttpClient) { }

    getMenuOptions() {
        return this.http.get<Menu[]>('/assets/data/main-menu.json');
    }
}
