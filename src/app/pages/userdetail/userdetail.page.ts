import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../interfaces/interfaces';
import { LocalService } from '../../services/local.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MainService } from '../../services/main.service';
import { NotificationsService } from '../../services/notifications.service';
import { WebsocketService } from '../../services/websocket.service';
import { environment } from 'src/environments/environment';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-userdetail',
  templateUrl: './userdetail.page.html',
  styleUrls: ['./userdetail.page.scss'],
})
export class UserdetailPage implements OnInit {
    user: User;
    token = '';
    webSocket: WebsocketService;
    localIp = '';
    loading: any;

  constructor(
    private mainService: MainService,
    private localService: LocalService,
    private notificationService: NotificationsService,
    private loadingCtrl: LoadingController,
    // private route: ActivatedRoute,
    private router: Router
    ) {
  }

  ionViewWillEnter() {
    // Check the LOCAL IP
    this.localService.getStorage('SERVER_IP')
    .then(async ip => {
        // console.log('user will enter SERVER_IP', ip);
        this.localIp = ip;
        if (ip && this.localIp !== '') {
            this.webSocket = await WebsocketService.getInstance(`http://${this.localIp}:${environment.socket_port}`);
            // console.log('connected', this.webSocket.socket.connected, ip, this.localIp);
            // this.webSocket.socket.on('connect', () => {
            WebsocketService.SOCKET_STATUS = this.webSocket.socket.connected;
            // });
        }
    })
    .catch((error) => {
        WebsocketService.SOCKET_STATUS = false;
    })
    .finally(() => {
        console.log('Finally User detail', this.webSocket.socket.connected);
        if (this.webSocket.socket.connected) {
            this.loadUserInfo();
        } else {
            this.router.navigateByUrl('/tabs/user');
        }
    });
  }

  ngOnInit() {
    // tslint:disable-next-line: no-string-literal
    // if (this.route.snapshot.data['user']) {
    //     // tslint:disable-next-line: no-string-literal
    //     this.user = this.route.snapshot.data['user'];
    // }
  }

    loadUserInfo() {
        this.localService.getUserInfo()
            .then((response) => {
                console.log('Detail', response);
                if (response.token && response.user) {
                    this.user = response.user;
                    this.token = response.token;
                } else {
                    this.user = null;
                    this.token = '';
                }

            }).
            catch((error) => {
                // this.localService.presentToast(`Error: ${error}`);
                this.user = null;
                this.token = '';
            });
    }

  logoutUser() {
    console.log('token logout: ', this.token);
    this.presentLoading('Cargando...');
    this.mainService.logoutUser(this.token)
        .then((resp) => {
            console.log('logout: ', resp);
            this.localService.deleteUser();
            this.localService.isAuthenticated = false;
            this.router.navigateByUrl('/tabs/user');
            this.loading.dismiss();
        })
        .catch((err) => {
            console.log(err.status);
            switch (err.status) {
                case 400:
                    this.notificationService.alertMessage('Se ha presentado un error con el cierre de sesión.', 'Error');
                    break;
                case 401:
                    this.localService.deleteUser();
                    this.localService.isAuthenticated = false;
                    this.notificationService.alertMessage('La sesión ha expirado, favor inicie sesión nuevamente.', 'Error');
                    this.router.navigateByUrl('/tabs/user');
                    break;
            }
            this.user = null;
            this.token = '';
            this.localService.isAuthenticated = false;
            this.loading.dismiss();
        })
        .finally(() => {
            this.loading.dismiss();
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
