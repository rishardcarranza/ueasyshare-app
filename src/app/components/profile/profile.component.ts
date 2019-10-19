import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../interfaces/interfaces';
import { MainService } from '../../services/main.service';
import { LocalService } from '../../services/local.service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

    @Input() user: User;
    @Input() token = '';

  constructor(
    private mainService: MainService,
    private localService: LocalService,
    private router: Router
  ) { }

  ngOnInit() {

  }

  logoutUser() {
    console.log('logout');
  }
}
