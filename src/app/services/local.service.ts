import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Menu, User } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})

export class LocalService {
    userResponse: any = null;

    private data = [];
    public isAuthenticated = false;

    constructor(
        private http: HttpClient,
        private storage: Storage
    ) { }


    async saveUser(user: User, token: string) {
        await this.storage.set('user', user);
        await this.storage.set('token', token);
        this.isAuthenticated = true;
    }

    deleteUser() {
        this.storage.remove('user');
        this.storage.remove('token');
        this.isAuthenticated = false;
    }

    async getUserInfo() {
        let token = '';
        await this.storage.get('token').then(resp => token = resp);
        // console.log('getUserInfo: ', token);
        if (token !== '') {
            let user: User;
            await this.storage.get('user').then(resp => user = resp);
            this.userResponse = { token, user };
            this.isAuthenticated = true;
        } else {
            this.userResponse = null;
        }

        return this.userResponse;
    }

    setStorage(key: string, value: any) {
        this.storage.set(key, value);
    }

    getStorage(key: string) {
        return this.storage.get(key);
    }

    removeStorage(key: string) {
        this.storage.remove(key);
    }

    getMenuOptions() {
        return this.http.get<Menu[]>('/assets/data/main-menu.json');
    }

}
