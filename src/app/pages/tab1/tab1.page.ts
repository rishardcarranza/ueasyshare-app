import { Component, OnInit } from '@angular/core';
// import { Socket } from 'ngx-socket-io';
// import io from 'socket.io-client';
// import { MainService } from '../../services/main.service';
import { environment } from '../../../environments/environment';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { WebsocketService } from '../../services/websocket.service';
import { LocalService } from '../../services/local.service';


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
    private barcodeScanner: BarcodeScanner
  ) { }

  ngOnInit() {
    // this.localIp = this.localService.getStorage('SERVER_IP');
    // Check the LOCAL IP
    this.localService.getStorage('SERVER_IP')
    .then(ip => {
        console.log('SERVER_IP', ip);
        this.localIp = ip;
        this.localIp = '192.168.1.4';
        // if (ip && this.localIp !== '') {
        this.connectToWS();
        // }
    });
  }


    scanQRCode() {
        this.barcodeScanner.scan()
        .then(barcodeData => {
            console.log('Barcode data', barcodeData);

            if (barcodeData.format === 'QR_CODE' && !barcodeData.cancelled) {
                this.localIp = barcodeData.text;
                this.connectToWS();
                // this.changeServerInfo(WebsocketService.SOCKET_STATUS);
            }
        }).catch(err => {
            console.log('Error', err);
        });
    }

    connectToWS() {
        console.log(`Connecting to websocket: ${this.localIp}`);
        this.webSocket = WebsocketService.getInstance(`http://${this.localIp}:${environment.socket_port}`);
        this.webSocket.socket.on('connect', () => {
            WebsocketService.SOCKET_STATUS = true;
            this.changeServerInfo(WebsocketService.SOCKET_STATUS);
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
        this.localService.setStorage('SERVER_IP', this.localIp);
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
