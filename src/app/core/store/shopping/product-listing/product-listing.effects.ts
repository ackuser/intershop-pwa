import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import b64u from 'b64u';
import { isEqual } from 'lodash-es';
import { EMPTY, of } from 'rxjs';
import { distinctUntilChanged, map, mapTo, mergeMap, switchMap, take } from 'rxjs/operators';

import {
  DEFAULT_PRODUCT_LISTING_VIEW_TYPE,
  PRODUCT_LISTING_ITEMS_PER_PAGE,
} from 'ish-core/configurations/injection-keys';
import { ViewType } from 'ish-core/models/viewtype/viewtype.types';
import { mapToPayload, whenFalsy, whenTruthy } from 'ish-core/utils/operators';
import { ApplyFilter, LoadFilterForCategory, LoadFilterForSearch, LoadProductsForFilter } from '../filter';
import { LoadProductsForCategory } from '../products';
import { SearchProducts } from '../search';

import * as actions from './product-listing.actions';
import { getProductListingView, getProductListingViewType } from './product-listing.selectors';

@Injectable()
export class ProductListingEffects {
  constructor(
    @Inject(PRODUCT_LISTING_ITEMS_PER_PAGE) private itemsPerPage: number,
    @Inject(DEFAULT_PRODUCT_LISTING_VIEW_TYPE) private defaultViewType: ViewType,
    private actions$: Actions,
    private activatedRoute: ActivatedRoute,
    private store: Store<{}>,
    private router: Router
  ) {}

  @Effect()
  initializePageSize$ = this.actions$.pipe(
    take(1),
    mapTo(new actions.SetProductListingPageSize({ itemsPerPage: this.itemsPerPage }))
  );

  @Effect()
  initializeDefaultViewType$ = this.store.pipe(
    select(getProductListingViewType),
    whenFalsy(),
    mapTo(new actions.SetViewType({ viewType: this.defaultViewType }))
  );

  @Effect()
  setViewTypeFromQueryParam$ = this.activatedRoute.queryParamMap.pipe(
    map(params => params.get('view')),
    whenTruthy(),
    distinctUntilChanged(),
    map((viewType: ViewType) => new actions.SetViewType({ viewType }))
  );

  @Effect()
  determineParams$ = this.actions$.pipe(
    ofType<actions.LoadMoreProducts>(actions.ProductListingActionTypes.LoadMoreProducts),
    mapToPayload(),
    switchMap(({ id, page }) =>
      this.activatedRoute.queryParamMap.pipe(
        map(params => ({
          id,
          sorting: params.get('sorting') || undefined,
          page: +params.get('page') || page || undefined,
          filters: params.get('filters') || undefined,
        })),
        distinctUntilChanged(isEqual)
      )
    ),
    map(({ id, filters, sorting, page }) => new actions.LoadMoreProductsForParams({ id, filters, sorting, page }))
  );

  @Effect()
  loadMoreProducts$ = this.actions$.pipe(
    ofType<actions.LoadMoreProductsForParams>(actions.ProductListingActionTypes.LoadMoreProductsForParams),
    mapToPayload(),
    switchMap(({ id, sorting, page, filters }) =>
      this.store.pipe(
        select(getProductListingView, { ...id, sorting, filters }),
        map(view => ({ id, sorting, page, filters, viewAvailable: !view.empty() && view.productsOfPage(page).length }))
      )
    ),
    mergeMap(({ id, sorting, page, filters, viewAvailable }) => {
      if (viewAvailable) {
        return of(new actions.SetProductListingPages({ id: { sorting, filters, ...id } }));
      }
      if (filters) {
        const searchParameter = b64u.toBase64(b64u.encode(filters));
        return of(new LoadProductsForFilter({ id: { ...id, filters }, searchParameter }));
      } else {
        switch (id.type) {
          case 'category':
            return of(new LoadProductsForCategory({ categoryId: id.value, page, sorting }));
          case 'search':
            return of(new SearchProducts({ searchTerm: id.value, page, sorting }));
          default:
            return EMPTY;
        }
      }
    })
  );

  @Effect()
  loadFilters$ = this.actions$.pipe(
    ofType<actions.LoadMoreProductsForParams>(actions.ProductListingActionTypes.LoadMoreProductsForParams),
    mapToPayload(),
    map(({ id, filters }) => ({ type: id.type, value: id.value, filters })),
    distinctUntilChanged(isEqual),
    mergeMap(({ type, value, filters }) => {
      if (filters) {
        const searchParameter = b64u.toBase64(b64u.encode(filters));
        return of(new ApplyFilter({ searchParameter }));
      } else {
        switch (type) {
          case 'category':
            return of(new LoadFilterForCategory({ uniqueId: value }));
          case 'search':
            return of(new LoadFilterForSearch({ searchTerm: value }));
          default:
            return EMPTY;
        }
      }
    })
  );
}