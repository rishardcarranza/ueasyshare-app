import { Injectable } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

    constructor(
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private router: Router
        ) { }

    // Toast
    async presentToast(message: string, duration: number = 2000) {
        const toast = await this.toastCtrl.create({
            message,
            duration
        });
        toast.present();
    }

    async alertDisconnected() {
        const alert = await this.alertCtrl.create({
            header: 'Servidor Desconectado',
            message: 'Primero debes conectarte al servidor de <strong>uEasyShare</strong> escaneando el código QR en la opción Conectar.',
            buttons: [
            // {
            //     text: 'Cancelar',
            //     role: 'cancel',
            //     cssClass: '',
            //     handler: (blah) => {
            //         // console.log('Confirm Cancel: blah');
            //     }
            // },
                {
                    text: 'Ir a Conectar',
                    cssClass: 'primary',
                    handler: () => {
                        this.router.navigateByUrl('/tabs/tab1');
                    }
                }
            ]
        });

        await alert.present();
    }

    async alertMessage(header: string, subHeader: string, message: string) {
        const alert = await this.alertCtrl.create({
            header,
            subHeader,
            message,
            buttons: ['Aceptar']
        });

        await alert.present();
    }

}
