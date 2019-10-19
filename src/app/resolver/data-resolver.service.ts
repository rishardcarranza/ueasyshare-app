import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { LocalService } from '../services/local.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class DataResolverService implements Resolve<any> {

  constructor(
      private localService: LocalService
  ) { }

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');

    return this.localService.getData(id);
  }
}
