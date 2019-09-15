import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MainService } from '../../services/main.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
    title = 'Servidores';
    serverInfo: any;
    serverInfoActual: any;

  constructor(
      public mainService: MainService
  ) {}

  ngOnInit() {
    // setTimeout(() => {
        // console.log('Socket status: ', this.wsService.socketStatus);
    this.getServerInfo();
    //   }, 500);
  }

  getServerInfo() {
    // this.mainService.emitServerInfo();

    this.mainService.getServerInfo()
        .subscribe((resp) => {
            this.serverInfo = resp;
            console.log(this.serverInfo);
        });

  }

  setActual() {
    if (this.serverInfo) {
        this.serverInfoActual = this.serverInfo;
        this.serverInfo = null;
        this.mainService.emitirUsuariosActivos();
    }
  }
}
