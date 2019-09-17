import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/interfaces';
import { MainService } from '../../services/main.service';
import { LocalService } from '../../services/local.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

    user = {
        username : '',
        password : ''
    };
    userAuth: User;
    token = '';

  constructor(
    private mainService: MainService,
    private localService: LocalService
  ) { }

  ngOnInit() {
    this.localService.getUserInfo()
        .then((response) => {
            console.log(response);
            if (response.token && response.user) {
                this.userAuth = response.user;
                this.token = response.token;
            } else {
                this.userAuth = null;
                this.token = '';
            }
        }).
        catch((error) => {
            this.localService.presentToast(`Error: ${error}`);
            this.userAuth = null;
            this.token = '';
        });
  }

  onLogin() {
    console.log('On Login');
    this.mainService.loginUser(this.user.username, this.user.password)
        .then((resp) => {
            // tslint:disable-next-line: no-string-literal
            this.userAuth = resp['user'];
            // tslint:disable-next-line: no-string-literal
            this.token = resp['key'];
            this.localService.saveUser(this.userAuth, this.token);
        })
        .catch((err) => {
            console.log(err.status);
            if (err.status === 400) {
                this.localService.presentToast('Usuario o contraseña incorrectos');
                this.userAuth = null;
                this.token = '';
            }
        });
  }

}
