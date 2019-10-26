import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../interfaces/interfaces';
import { LocalService } from '../../services/local.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MainService } from '../../services/main.service';

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
    this.mainService.logoutUser(this.token)
    .then((resp) => {
        this.localService.deleteUser();
        this.localService.isAuthenticated = false;
        this.router.navigateByUrl('/tabs/user');
    })
    .catch((err) => {
        console.log(err.status);
        if (err.status === 400) {
            // this.localService.presentToast('Error al cerrar la sesión');
            this.user = null;
            this.token = '';
            this.localService.isAuthenticated = false;
        }
    });
  }
}
