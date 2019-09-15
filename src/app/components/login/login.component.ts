import { Component, OnInit } from '@angular/core';
import { MainService } from '../../services/main.service';
import { User } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

    user = {
        username : '',
        password : ''
    };
    userAuth: User;
    token = '';

  constructor(
    private mainService: MainService
  ) { }

  ngOnInit() {}

  onLogin() {
    this.mainService.loginUser(this.user.username, this.user.password)
        .then((resp) => {
            // tslint:disable-next-line: no-string-literal
            this.userAuth = resp['user'];
            // tslint:disable-next-line: no-string-literal
            this.token = resp['key'];
        })
        .catch((err) => {
            console.log(err.status);
            if (err.status === 400) {
                console.log('Usuario o contraseña incorrectos');
                this.userAuth = null;
                this.token = '';
            }
        });
  }

}
