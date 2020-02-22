import { Injectable } from '@angular/core';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
    loading: any;

    constructor(
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private router: Router,
        private loadingCtrl: LoadingController
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
            // tslint:disable-next-line: max-line-length
            message: 'Primero debes conectarte al servidor de <strong>uEasyShare</strong> escaneando el código QR en la opción Conectar o Manualmente.',
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

    async alertMessage(message: string, header?: string, subHeader?: string) {
        const alert = await this.alertCtrl.create({
            header,
            subHeader,
            message,
            buttons: ['Aceptar']
        });

        await alert.present();
    }

    // tslint:disable-next-line: ban-types
    async alertConnect(callback?: (data) => void) {
        const alert = await this.alertCtrl.create({
            header: 'Conectar Manualmente',
            inputs: [
            {
                name: 'txtIP',
                type: 'text',
                id: 'txtIP',
                placeholder: '192.168.1.10'
            },
            {
                name: 'txtPort',
                type: 'number',
                min: 2,
                max: 4,
                id: 'txtPort',
                placeholder: '5000'
            }
            ],
            buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                    console.log('Confirm Cancel');
                }
            },
            {
                text: 'Conectar',
                handler: callback
            }
            ]
        });

        await alert.present();
    }

    async presentLoading(message: string) {
        this.loading = await this.loadingCtrl.create({
            message
        //   duration: 2000
        });
        return this.loading;
    }

}
