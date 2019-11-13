import { Component, OnInit } from '@angular/core';
// import { Socket } from 'ngx-socket-io';
// import io from 'socket.io-client';
// import { MainService } from '../../services/main.service';
import { environment } from '../../../environments/environment';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { WebsocketService } from '../../services/websocket.service';
import { LocalService } from '../../services/local.service';
import { User } from '../../interfaces/interfaces';
import { NotificationsService } from '../../services/notifications.service';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit  {
    title = 'Servidores';
    serverInfoActual: any;
    webSocket: WebsocketService;
    localIp: string;

    userAuth: User;
    token = '';

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
    private notifications: NotificationsService
  ) { }

  ionViewWillEnter() {
    // Check the LOCAL IP
    this.localService.getStorage('SERVER_IP')
    .then(ip => {
        console.log('SERVER_IP', ip);
        this.localIp = ip;
        // this.localIp = '172.20.10.2';
        if (ip && this.localIp !== '') {
            this.connectToWS();
        }
    });
  }

  ngOnInit() {  }


    scanQRCode() {
        this.barcodeScanner.scan()
        .then(barcodeData => {
            console.log('Barcode data', barcodeData);
            if (barcodeData.format === 'QR_CODE' && !barcodeData.cancelled) {
                this.localIp = barcodeData.text;
                this.localService.setStorage('SERVER_IP', this.localIp);
                this.connectToWS();
                // this.changeServerInfo(WebsocketService.SOCKET_STATUS);
            }
        }).catch(err => {
            console.log('Error', err);
        });
    }

    connectToWS() {
        this.webSocket = WebsocketService.getInstance(`http://${this.localIp}:${environment.socket_port}`);
        console.log(`Connecting to websocket: http://${this.localIp}:${environment.socket_port}`, WebsocketService.SOCKET_STATUS);
        this.webSocket.socket.on('connect', () => {
            WebsocketService.SOCKET_STATUS = true;
            this.changeServerInfo(WebsocketService.SOCKET_STATUS);
            this.localService.getUserInfo()
                .then((response) => {
                    if (response.token && response.user) {
                        this.userAuth = response.user;
                        this.token = response.token;
                        this.webSocket.emit('configurar-usuario', this.userAuth, () => {});
                    } else {
                        this.token = '';
                        // this.router.navigateByUrl('/tabs/user');
                        const data = {
                            first_name: 'Desconocido',
                            last_name: '',
                            username: '',
                            email: ''
                        };
                        this.webSocket.emit('configurar-usuario', data, () => {});
                    }
                })
                .catch((error) => {
                    this.notifications.presentToast(`Error: ${error}`);
                    // this.notifications.alertDisconnected();
                    this.token = '';
                });
        });

        this.webSocket.socket.on('disconnect', (reason) => {
            WebsocketService.SOCKET_STATUS = false;
            console.log('reason: ', reason, WebsocketService.SOCKET_STATUS);
            // if (reason === 'io server disconnect') {
            //     this.webSocket.socket.connect();
            // }
            this.changeServerInfo(WebsocketService.SOCKET_STATUS);
        });
        // this.webSocket.emitServerInfo();
        // console.log('listen server info: ', this.webSocket.getServerInfo());
    }

    changeServerInfo(status: boolean) {
        console.log('change server info', status);
        if (status) {
            this.serverInfo.icon = 'checkmark-circle';
            this.serverInfo.color = 'success';
            this.serverInfo.text = 'Servidor Conectado';
            this.serverInfo.ip = `IP: ${WebsocketService.IP}`;
        } else {
            this.serverInfo.icon = 'close-circle';
            this.serverInfo.color = 'danger';
            this.serverInfo.text = 'Servidor Desconectado';
            this.serverInfo.ip = 'Escanea el código QR para conectar';
        }

        this.webSocket.emitirUsuariosActivos();
    }
//   getServerInfo() {
//     this.mainService.getServerInfo()
//         .subscribe((resp) => {
//             this.serverInfo = resp;
//             console.log(this.serverInfo);
//         });

//   }

//   setActual() {
//     if (this.serverInfo) {
//         this.serverInfoActual = this.serverInfo;
//         this.serverInfo = null;
//         this.mainService.emitirUsuariosActivos();
//     }
//   }
}
