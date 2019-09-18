import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Menu, User } from '../interfaces/interfaces';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LocalService {
    userResponse: any = null;

  constructor(
      private http: HttpClient,
      private toastCtrl: ToastController,
      private storage: Storage
    ) { }


    saveUser(user: User, token: string) {
        this.storage.set('user', user);
        this.storage.set('token', token);
    }

    deleteUser() {
        this.storage.remove('user');
        this.storage.remove('token');
    }

    async getUserInfo() {
        let token = '';
        await this.storage.get('token').then(resp => token = resp);

        if (token !== '') {
            let user: User;
            await this.storage.get('user').then(resp => user = resp);
            this.userResponse = { token, user };
        } else {
            this.userResponse = null;
        }

        return this.userResponse;
    }


    getMenuOptions() {
        return this.http.get<Menu[]>('/assets/data/main-menu.json');
    }

    async presentToast(message: string, duration: number = 2000) {
        const toast = await this.toastCtrl.create({
          message,
          duration
        });
        toast.present();
    }


}
