import { Component, OnInit } from '@angular/core';
import { MainService } from '../../services/main.service';
import { LocalService } from '../../services/local.service';
import { User } from '../../interfaces/interfaces';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
    title = 'Controles';

    user: User;
    token = '';

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
        private localService: LocalService) {}

    ionViewWillEnter() {
        this.loadUserInfo();
    }

    ngOnInit() {}

    loadUserInfo() {
        this.localService.getUserInfo()
            .then((response) => {
                console.log('Controls', response);
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
        setTimeout(() => {
            this.playStatus = false;
        }, 500);
    }

    onPause() {
        console.log('click pause');
        this.pauseStatus = true;
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
        setTimeout(() => {
            this.shutdownStatus = false;
        }, 2000);
    }

    onRestart() {
        console.log('click restart');
        this.restartStatus = true;
        setTimeout(() => {
            this.restartStatus = false;
        }, 2000);
    }

}
