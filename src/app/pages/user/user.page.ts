import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/interfaces';
import { MainService } from '../../services/main.service';
import { LocalService } from '../../services/local.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

    username = '';
    password = '';

    userAuth: User;
    token = '';

  constructor(
    private mainService: MainService,
    private localService: LocalService,
    private router: Router
  ) {
    console.log('user constructor');
  }

  ionViewWillEnter() {
    this.localService.getUserInfo()
        .then((response) => {

            if (response.token && response.user) {
                this.userAuth = response.user;
                this.token = response.token;
                this.router.navigateByUrl(`/tabs/user/detail/${this.userAuth.id}`);
            } else {
                this.username = '';
                this.password = '';
                this.token = '';
                this.router.navigateByUrl(`/tabs/user`);
            }
        }).
        catch((error) => {
            this.localService.presentToast(`Error: ${error}`);
            this.username = '';
            this.password = '';
            this.token = '';
        });
  }

  ngOnInit() { }

  onLogin() {

    this.mainService.loginUser(this.username, this.password)
        .then((resp) => {
            // tslint:disable-next-line: no-string-literal
            this.userAuth = resp['user'];
            // tslint:disable-next-line: no-string-literal
            this.token = resp['key'];
            this.localService.saveUser(this.userAuth, this.token);

            this.localService.setData(this.userAuth.id, this.userAuth);
            this.router.navigateByUrl(`/tabs/user/detail/${this.userAuth.id}`);
            // .router.navigateByUrl('/tabs/user/detail');
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
