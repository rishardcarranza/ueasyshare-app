import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
// import { Socket } from 'ngx-socket-io';
// import io from 'socket.io-client';
import { MainService } from '../../services/main.service';
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

    swiperOpts = {
        allowSlidePrev: false,
        allowSlideNext: false
    };

    serverInfo = {
        icon: 'close-circle',
        color: 'danger',
        text: 'Servidor Desconectado',
        ip: ''
    };

  constructor(
    private localService: LocalService,
    private barcodeScanner: BarcodeScanner
  ) { }

  ngOnInit() {
    this.changeServerInfo(WebsocketService.SOCKET_STATUS);
  }


  scanQRCode() {
      this.barcodeScanner.scan()
      .then(barcodeData => {
          console.log('Barcode data', barcodeData);

          if (barcodeData.format === 'QR_CODE' && !barcodeData.cancelled) {
            this.connectToWS(barcodeData.text);
            this.changeServerInfo(WebsocketService.SOCKET_STATUS);
          }
        }).catch(err => {
            console.log('Error', err);
        });
    }

    connectToWS(localIp: string) {
        console.log(`Connecting to websocket: ${localIp}`);
        this.webSocket = WebsocketService.getInstance(`http://${localIp}:${environment.socket_port}`);
        this.webSocket.emitirUsuariosActivos();
        this.localService.setStorage('SERVER_IP', localIp);
    }

    changeServerInfo(status: boolean) {
        console.log('change server info', status);
        if (status) {
            this.serverInfo.icon = 'checkmark-circle';
            this.serverInfo.color = 'success';
            this.serverInfo.text = 'Servidor Conectado';
            this.serverInfo.ip = `IP: ${WebsocketService.URL}`;
        } else {
            this.serverInfo.icon = 'close-circle';
            this.serverInfo.color = 'danger';
            this.serverInfo.text = 'Servidor Desconectado';
            this.serverInfo.ip = '';
        }
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
