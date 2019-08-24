import { Component, OnInit } from '@angular/core';
import { Menu } from '../../interfaces/interfaces';
import { LocalService } from '../../services/local.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

    options: Menu[];

  constructor(private localService: LocalService) { }

  ngOnInit() {
    // this.options = this.localService.getMenuOptions();
    this.localService.getMenuOptions()
        .subscribe(resp => {
            this.options = resp;
        });
  }

}
