import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/interfaces';
import { MainService } from '../../services/main.service';
import { LocalService } from '../../services/local.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationsService } from '../../services/notifications.service';
import { environment } from '../../../environments/environment';
import { LoadingController } from '@ionic/angular';

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
    loading: any;

  constructor(
    private mainService: MainService,
    private localService: LocalService,
    private router: Router,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
  ) {  }

    ionViewWillEnter() {
        // Check the LOCAL IP
        this.localService.getStorage('SERVER_IP')
            .then(async ip => {
                console.log('user will enter SERVER_IP', ip);
                this.localIp = ip;
                if (ip && this.localIp !== '') {
                    console.log('connected', (ip && this.localIp !== ''), ip, this.localIp);
                    this.webSocket = await WebsocketService.getInstance(`http://${this.localIp}:${environment.socket_port}`);
                    // this.webSocket.socket.on('connect', () => {
                    WebsocketService.SOCKET_STATUS = this.webSocket.socket.connected;
                    // });
                } else {
                    // Lanzar Toast
                    this.notifications.alertDisconnected();
                }
            })
            .catch((error) => {
                WebsocketService.SOCKET_STATUS = false;
            })
            .finally(() => {
                console.log('Finally User detail', this.webSocket.socket.connected);
                if (this.webSocket.socket.connected) {
                    this.setUserInfo();
                } else {
                    this.router.navigateByUrl('/tabs/user');
                }
            });
        // }
  }

  ngOnInit() { }

  onLogin() {
    this.presentLoading('Cargando...');
    this.mainService.loginUser(this.username, this.password)
        .then((resp) => {
            console.log('on login: ', resp);
            // tslint:disable-next-line: no-string-literal
            this.userAuth = resp['user'];
            // tslint:disable-next-line: no-string-literal
            this.token = resp['key'];
            this.localService.saveUser(this.userAuth, this.token)
            .then(() => {
                if (this.webSocket.socket.connected) {
                    this.setUserInfo();
                } else {
                    this.notifications.alertDisconnected();
                }
            });
            this.loading.dismiss();
        })
        .catch((err) => {
            console.log(err.status);
            if (err.status === 400) {
                this.notifications.alertMessage('Usuario o contraseña incorrectos', 'Error');
                this.userAuth = null;
                this.token = '';
                this.localService.isAuthenticated = false;
            }
            this.loading.dismiss();
        });
  }

  setUserInfo() {
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
                };
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
  }

  // Loading
    async presentLoading(message: string) {
        this.loading  = await this.loadingCtrl.create({
            message
        });
        return this.loading.present();
    }

}
