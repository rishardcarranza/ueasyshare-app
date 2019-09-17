import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
      HeaderComponent,
      MenuComponent,
      ProfileComponent
  ],
  exports: [
      HeaderComponent,
      MenuComponent,
      ProfileComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule
  ]
})
export class ComponentsModule { }
