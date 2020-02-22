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
    imageClose = false;
    closePStatus = false;
    slideLevelAux = 100;
    realLevel = 400;

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

        const value = (checked) ? '1' : '0';
        this.mainService.sendCommand(this.token, 'display', value)
            .then((resp) => {
                console.log(resp);
            });
    }

    changeRange(event) {
        // tslint:disable-next-line: radix
        const slideCurrentLevel = parseInt(event.detail.value);
        const factor = 106;
        const minValue = -10239;
        const maxValue = 400;

        console.log(slideCurrentLevel, factor, this.realLevel, this.slideLevelAux);

        if (slideCurrentLevel > this.slideLevelAux) {
            this.realLevel = minValue + (factor * (0 + slideCurrentLevel));
            console.log('Current level mayor', this.realLevel);
        } else if (slideCurrentLevel < this.slideLevelAux) {
            this.realLevel = maxValue - (factor * (100 - slideCurrentLevel));
            console.log('Current level menor', this.realLevel);
        } else {
            console.log('Current level cero', this.realLevel);
        }
        this.slideLevelAux = slideCurrentLevel;


        this.mainService.sendCommand(this.token, 'volume', this.realLevel.toString())
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
        }, 300);
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
        }, 300);
    }

    onStop() {
        console.log('click stop');
        this.stopStatus = true;

        this.mainService.sendCommand(this.token, 'stop', '')
            .then((resp) => {
                console.log(resp);
            })
            .catch((error) => {
                console.log(error);
            });
        setTimeout(() => {
            this.stopStatus = false;
        }, 300);
    }

    onNext() {
        this.nextStatus = true;
        this.mainService.sendCommand(this.token, 'next', '')
            .then((resp) => {
                console.log(resp);
            });
        setTimeout(() => {
            this.nextStatus = false;
        }, 300);
    }

    onPrev() {
        this.prevStatus = true;
        this.mainService.sendCommand(this.token, 'prev', '')
            .then((resp) => {
                console.log(resp);
            });
        setTimeout(() => {
            this.prevStatus = false;
        }, 300);
    }

    onCloseP() {
        this.closePStatus = true;
        this.mainService.sendCommand(this.token, 'close-presentation', '')
            .then((resp) => {
                console.log(resp);
            });
        setTimeout(() => {
            this.closePStatus = false;
        }, 300);
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
        }, 1000);
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
        }, 1000);
    }

    onCloseImage() {
        this.imageClose = true;

        this.mainService.sendCommand(this.token, 'close-image', '')
            .then((resp) => {
                console.log(resp);
            });
        setTimeout(() => {
            this.imageClose = false;
        }, 1000);
    }

}
