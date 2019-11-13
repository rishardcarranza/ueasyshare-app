import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../interfaces/interfaces';
import { LocalService } from '../../services/local.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MainService } from '../../services/main.service';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-userdetail',
  templateUrl: './userdetail.page.html',
  styleUrls: ['./userdetail.page.scss'],
})
export class UserdetailPage implements OnInit {
    user: User;
    token = '';

  constructor(
    private mainService: MainService,
    private localService: LocalService,
    private notificationService: NotificationsService,
    // private route: ActivatedRoute,
    private router: Router
    ) {
  }

  ionViewWillEnter() {
    this.loadUserInfo();
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
    this.mainService.logoutUser(this.token)
        .then((resp) => {
            console.log('logout: ', resp);
            this.localService.deleteUser();
            this.localService.isAuthenticated = false;
            this.router.navigateByUrl('/tabs/user');
        })
        .catch((err) => {
            console.log(err.status);
            switch (err.status) {
                case 400:
                    this.notificationService.alertMessage('Error', '', 'Se ha presentado un error con el cierre de sesión.');
                    break;
                case 401:
                    this.localService.deleteUser();
                    this.localService.isAuthenticated = false;
                    this.notificationService.alertMessage('Error', '', 'La sesión ha expirado, favor inicie sesión nuevamente.');
                    this.router.navigateByUrl('/tabs/user');
                    break;
            }
            this.user = null;
            this.token = '';
            this.localService.isAuthenticated = false;
        });
  }
}
