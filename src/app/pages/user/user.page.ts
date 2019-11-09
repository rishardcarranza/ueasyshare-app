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
    localIp = '';

    userAuth: User;
    token = '';

  constructor(
    private mainService: MainService,
    private localService: LocalService,
    private router: Router,
    private notifications: NotificationsService
  ) {  }

    ionViewWillEnter() {
        // if (WebsocketService.SOCKET_STATUS) {
        //     this.setUserInfo(WebsocketService.SOCKET_STATUS);
        // } else {
        // Check the LOCAL IP
        this.localService.getStorage('SERVER_IP')
            .then(ip => {
                console.log('user will enter SERVER_IP', ip);
                this.localIp = ip;
                if (ip && this.localIp !== '') {
                // this.connectToWS();
                    this.webSocket = WebsocketService.getInstance(`http://${this.localIp}:${environment.socket_port}`);

                    this.webSocket.socket.on('connect', () => {
                        WebsocketService.SOCKET_STATUS = true;
                    });
                } else {
                    // Lanzar Toast
                    this.notifications.alertDisconnected();
                }
            })
            .catch((error) => {
                WebsocketService.SOCKET_STATUS = false;
            })
            .finally(() => {
                this.setUserInfo(WebsocketService.SOCKET_STATUS);
            });
        // }
  }

  ngOnInit() { }

  onLogin() {
    this.mainService.loginUser(this.username, this.password)
        .then((resp) => {
            console.log('on login: ', resp);
            // tslint:disable-next-line: no-string-literal
            this.userAuth = resp['user'];
            // tslint:disable-next-line: no-string-literal
            this.token = resp['key'];
            this.localService.saveUser(this.userAuth, this.token)
            .then(() => {
                this.setUserInfo(WebsocketService.SOCKET_STATUS);
                // this.webSocket.emitirUsuariosActivos();
                // this.router.navigateByUrl('/tabs/user/detail');
            });
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

  setUserInfo(status: boolean) {
    console.log('socket status user: ', status);
    if (status) {
        console.log(this.webSocket);
        this.localService.getUserInfo()
            .then((response) => {
                if (response.token && response.user) {
                    this.userAuth = response.user;
                    this.token = response.token;
                    this.router.navigateByUrl('/tabs/user/detail');
                    this.webSocket.emit('configurar-usuario', this.userAuth, () => {});
                } else {
                    this.username = '';
                    this.password = '';
                    this.token = '';
                    // this.router.navigateByUrl('/tabs/user');
                    const data = {
                        first_name: 'Desconocido',
                        last_name: '',
                        username: '',
                        email: ''
                    }
                    this.webSocket.emit('configurar-usuario', data, () => {});
                }
            })
            .catch((error) => {
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

}
