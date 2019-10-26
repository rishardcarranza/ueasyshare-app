import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/interfaces';
import { MainService } from '../../services/main.service';
import { LocalService } from '../../services/local.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationsService } from '../../services/notifications.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

    username = '';
    password = '';
    webSocket: WebsocketService;

    userAuth: User;
    token = '';

  constructor(
    private mainService: MainService,
    private localService: LocalService,
    private router: Router,
    private notifications: NotificationsService
  ) {
    if (environment.debug) {
        console.log('UserPage constructor', WebsocketService.SOCKET_STATUS);
    }

    if (WebsocketService.SOCKET_STATUS) {
        this.webSocket = WebsocketService.getInstance();
    }
  }

  ionViewWillEnter() {
    if (environment.debug) {
        console.log('socket status', WebsocketService.SOCKET_STATUS);
    }

    if (WebsocketService.SOCKET_STATUS) {
        this.localService.getUserInfo()
            .then((response) => {

                if (response.token && response.user) {
                    this.userAuth = response.user;
                    this.token = response.token;
                    this.router.navigateByUrl('/tabs/user/detail');
                } else {
                    this.username = '';
                    this.password = '';
                    this.token = '';
                    this.router.navigateByUrl('/tabs/user');
                }
            }).
            catch((error) => {
                this.notifications.presentToast(`Error: ${error}`);
                // this.notifications.alertDisconnected();
                this.username = '';
                this.password = '';
                this.token = '';
            });
    } else {
        // Lanzar Toast
        this.notifications.alertDisconnected();
    }

  }

  ngOnInit() { }

  onLogin() {

    this.mainService.loginUser(this.username, this.password)
        .then((resp) => {
            // console.log(resp);
            // tslint:disable-next-line: no-string-literal
            this.userAuth = resp['user'];
            // tslint:disable-next-line: no-string-literal
            this.token = resp['key'];
            this.localService.saveUser(this.userAuth, this.token);
            this.localService.isAuthenticated = true;
            this.webSocket.emitirUsuariosActivos();
            // this.router.navigateByUrl(`/tabs/user/detail/${this.userAuth.id}`);
            this.router.navigateByUrl('/tabs/user/detail');
        })
        .catch((err) => {
            console.log(err.status);
            if (err.status === 400) {
                this.notifications.alertMessage('Error', '', 'Usuario o contraseña incorrectos');
                this.userAuth = null;
                this.token = '';
                this.localService.isAuthenticated = false;
            }
        });
  }

}
