import { Component, OnInit } from '@angular/core';
import { MainService } from '../../services/main.service';
import { LocalService } from '../../services/local.service';
import { User } from '../../interfaces/interfaces';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationsService } from '../../services/notifications.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
    title = 'Controles';

    user: User;
    token = '';
    webSocket: WebsocketService;
    localIp = '';

    segmentValue = 'media';
    displayStatus = 'Encendida';
    shutdownStatus = false;
    restartStatus = false;
    playStatus = false;
    pauseStatus = false;
    prevStatus = false;
    stopStatus = false;
    nextStatus = false;

    constructor(
        private mainService: MainService,
        private localService: LocalService,
        private notifications: NotificationsService
    ) {}

    ionViewWillEnter() {
        // Check the LOCAL IP
        this.localService.getStorage('SERVER_IP')
            .then(ip => {
                console.log('user will enter SERVER_IP', ip);
                this.localIp = ip;
                if (ip && this.localIp !== '') {
                    console.log('connected', (ip && this.localIp !== ''), ip, this.localIp);
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
                this.loadUserInfo();
            });
            // }
    }

    ngOnInit() {}

    loadUserInfo() {
        this.localService.getUserInfo()
            .then((response) => {
                console.log('Controls', response);
                if (response.token && response.user) {
                    this.user = response.user;
                    this.token = response.token;

                    this.webSocket.emit('configurar-usuario', this.user, () => {});
                } else {
                    // this.user.username = environment.default_user;
                    this.token = environment.token;
                    console.log('user load info', this.user, this.token);

                    const data = {
                        first_name: 'Desconocido',
                        last_name: '',
                        username: environment.default_user,
                        email: ''
                    };
                    this.webSocket.emit('configurar-usuario', data, () => {});
                }

            }).
            catch((error) => {
                // this.localService.presentToast(`Error: ${error}`);
                console.log(`Error: ${error}`);
                this.user = null;
                this.token = '';
            });
    }

    segmentChanged(event) {
        this.segmentValue = event.detail.value;
        // console.log(this.segmentValue);
    }

    changeDisplay(event) {
        // console.log(event.detail.checked);
        const checked = event.detail.checked;
        this.displayStatus = (checked) ? 'Encendida' : 'Apagada';
    }

    changeRange(event) {
        // console.log(event.detail.value);
        const level = event.detail.value;

        this.mainService.sendCommand(this.token, 'volume', level)
            .then((resp) => {
                console.log(resp);
            });
    }

    onPlay() {
        console.log('click play');
        this.playStatus = true;

        this.mainService.sendCommand(this.token, 'play', '')
            .then((resp) => {
                console.log(resp);
            });
        setTimeout(() => {
            this.playStatus = false;
        }, 500);
    }

    onPause() {
        console.log('click pause');
        this.pauseStatus = true;

        this.mainService.sendCommand(this.token, 'pause', '')
            .then((resp) => {
                console.log(resp);
            });
        setTimeout(() => {
            this.pauseStatus = false;
        }, 500);
    }

    onPrev() {
        console.log('click prev' );
        this.prevStatus = true;

        setTimeout(() => {
            this.prevStatus = false;
        }, 500);
    }

    onStop() {
        console.log('click stop');
        this.stopStatus = true;

        this.mainService.sendCommand(this.token, 'stop', '')
            .then((resp) => {
                console.log(resp);
            });
        setTimeout(() => {
            this.stopStatus = false;
        }, 500);
    }

    onNext() {
        console.log('click next');
        this.nextStatus = true;
        setTimeout(() => {
            this.nextStatus = false;
        }, 500);
    }

    onShutdown() {
        console.log('click shutdown');
        this.shutdownStatus = true;

        this.mainService.sendCommand(this.token, 'poweroff', '')
            .then((resp) => {
                console.log(resp);
            });
        setTimeout(() => {
            this.shutdownStatus = false;
        }, 2000);
    }

    onRestart() {
        console.log('click restart');
        this.restartStatus = true;

        this.mainService.sendCommand(this.token, 'reboot', '')
            .then((resp) => {
                console.log(resp);
            });
        setTimeout(() => {
            this.restartStatus = false;
        }, 2000);
    }

}
