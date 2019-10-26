import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LocalService } from '../services/local.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {

  constructor(
      private localService: LocalService,
      private router: Router
  ) { }

  canActivate(): boolean {
    this.localService.getUserInfo()
        .then((response) => {
            console.log('Guard', response);
            if (response.token && response.user) {
                return true;
            } else {
                this.router.navigateByUrl('/tabs/user');
                return false;
            }

        });
    console.log('Final false');
    return true;
    // let result = false;
    // console.log('UserGuard', this.localService.isAuthenticated);
    // return this.localService.isAuthenticated;
    // return false;
  }


}
