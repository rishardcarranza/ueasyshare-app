import { Component, OnInit, ViewChild } from '@angular/core';
// import { Socket } from 'ngx-socket-io';
// import io from 'socket.io-client';
// import { MainService } from '../../services/main.service';
import { environment } from '../../../environments/environment';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { WebsocketService } from '../../services/websocket.service';
import { LocalService } from '../../services/local.service';
import { User } from '../../interfaces/interfaces';
import { NotificationsService } from '../../services/notifications.service';
import { IonList, Events, LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit  {
    @ViewChild('listConnect', {static: true}) listConnect: IonList;

    title = 'Servidores';
    serverInfoActual: any;
    webSocket: WebsocketService;
    localIp: string;
    socketStatus = false;

    userAuth: User;
    token = '';
    loading: any;

    swiperOpts = {
        allowSlidePrev: false,
        allowSlideNext: false
    };

    serverInfo = {
        icon: 'close-circle',
        color: 'danger',
        text: 'Servidor Desconectado',
        ip: 'Escanea el código QR para conectar'
    };

  constructor(
    private localService: LocalService,
    private barcodeScanner: BarcodeScanner,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController
    // private events: Events
  ) { }

  ionViewWillEnter() {
    // Check the LOCAL IP
    this.localService.getStorage('SERVER_IP')
        .then(ip => {
            console.log('SERVER_IP', ip);
            this.localIp = ip;
            // this.localIp = '172.20.10.2';
            if (ip && this.localIp !== '') {
                this.connectToWS(this.localIp, environment.socket_port);
            }
        });
  }

  ngOnInit() {}


    scanQRCode() {
        this.barcodeScanner.scan()
        .then(barcodeData => {
            console.log('QR code data', barcodeData);
            if (barcodeData.format === 'QR_CODE' && !barcodeData.cancelled) {
                this.localIp = barcodeData.text;
                // this.localService.setStorage('SERVER_IP', this.localIp);
                this.connectToWS(this.localIp, environment.socket_port);
                // this.changeServerInfo(WebsocketService.SOCKET_STATUS);
            }
        })
        .catch(err => {
            console.log('Error', err);
        })
        .finally(() => {
            // this.connectToWS(this.localIp, environment.socket_port);
        });
    }

    async connectToWS(localIp: string, socketPort: string) {
        this.loading = this.presentLoading('Conectando...');
        this.webSocket = await WebsocketService.getInstance(`http://${localIp}:${socketPort}`);
        console.log(`Connecting to websocket: http://${localIp}:${socketPort}`, this.webSocket.socket.connected);

        await this.webSocket.socket.on('connect', () => {
            WebsocketService.SOCKET_STATUS = true;
            this.socketStatus = WebsocketService.SOCKET_STATUS;
            this.localService.setStorage('SERVER_IP', localIp);

            this.loadUserInfo();
        });

        await this.webSocket.socket.on('disconnect', () => {
            WebsocketService.SOCKET_STATUS = false;
            this.socketStatus = WebsocketService.SOCKET_STATUS;
        });

        setTimeout(() => {
            if (!this.socketStatus) {
                WebsocketService.destruct();
                // tslint:disable-next-line: max-line-length
                this.notifications.alertMessage(`No pudo establecer la conexión con el servidor <strong>${localIp}:${socketPort}</strong><br>Favor revisar.`);
            }
            this.loading.dismiss();
        }, 500);
    }

    loadUserInfo() {
        this.localService.getUserInfo()
                .then((response) => {
                    if (response.token && response.user) {
                        this.userAuth = response.user;
                        this.token = response.token;
                        this.webSocket.emit('configurar-usuario', this.userAuth, () => {});
                    } else {
                        const data = {
                            id: 0,
                            username: '',
                            password: '',
                            first_name: 'Desconocido',
                            last_name: '',
                            email: '',
                            is_active: true,
                            date_joined: '',
                            last_login: ''
                        };

                        this.token = environment.token;
                        this.userAuth = data;
                        this.webSocket.emit('configurar-usuario', data, () => {});
                    }
                })
                .catch((error) => {
                    this.notifications.presentToast(`Error: ${error}`);
                    console.log(`Error: ${error}`);
                    this.userAuth = null;
                    this.token = '';
                });
    }

    connectManually() {
        if (!this.socketStatus) {
            this.notifications.alertConnect((data) => {
                console.log('Connect from Tab1', data);
                this.localIp = data.txtIP;
                this.connectToWS(this.localIp, data.txtPort);
            });
        } else {
            // tslint:disable-next-line: max-line-length
            this.notifications.alertMessage(`Conectado actualmente al servidor <strong>${this.localIp}:${environment.socket_port}</strong><br>Desconectar la conexión actual para cambiar a otra diferente.`);
        }
    }

    disconnectSocket() {
        console.log('Disconnect');
        this.webSocket.socket.close();
        this.localService.removeStorage('SERVER_IP');
        // this.localService.deleteUser();
        this.socketStatus = false;
        WebsocketService.destruct();
        this.listConnect.closeSlidingItems();
    }

    // Loading
    async presentLoading(message: string) {
        this.loading  = await this.loadingCtrl.create({
            message
        });
        return this.loading.present();
    }
}
