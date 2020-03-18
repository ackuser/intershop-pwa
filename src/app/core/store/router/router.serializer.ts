import { RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer } from '@ngrx/router-store';

import { RouterState } from './router.reducer';

export class CustomRouterSerializer implements RouterStateSerializer<RouterState> {
  serialize(routerState: RouterStateSnapshot): RouterState {
    let route = routerState.root;

    let data = route.data;
    let params = route.params;
    while (route.firstChild) {
      route = route.firstChild;
      data = { ...data, ...route.data };
      params = { ...params, ...route.params };
    }

    const {
      url,
      root: { queryParams },
    } = routerState;

    return { url, params, queryParams, data };
  }
}
