import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action, Store, StoreModule, combineReducers } from '@ngrx/store';
import { cold, hot } from 'jest-marbles';
import { Observable, of, throwError } from 'rxjs';
import { anyString, anything, capture, instance, mock, verify, when } from 'ts-mockito';

import { Basket } from 'ish-core/models/basket/basket.model';
import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { LineItem } from 'ish-core/models/line-item/line-item.model';
import { coreReducers } from 'ish-core/store/core-store.module';
import { AddressService } from '../../../services/address/address.service';
import { BasketService } from '../../../services/basket/basket.service';
import { OrderService } from '../../../services/order/order.service';
import { shoppingReducers } from '../../shopping/shopping-store.module';
import { checkoutReducers } from '../checkout-store.module';

import { BasketItemsEffects } from './basket-items.effects';
import * as basketActions from './basket.actions';

describe('Basket Items Effects', () => {
  let actions$: Observable<Action>;
  let basketServiceMock: BasketService;
  let orderServiceMock: OrderService;
  let addressServiceMock: AddressService;
  let effects: BasketItemsEffects;
  let store$: Store<{}>;

  beforeEach(() => {
    basketServiceMock = mock(BasketService);
    orderServiceMock = mock(OrderService);
    addressServiceMock = mock(AddressService);

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          ...coreReducers,
          shopping: combineReducers(shoppingReducers),
          checkout: combineReducers(checkoutReducers),
        }),
      ],
      providers: [
        BasketItemsEffects,
        provideMockActions(() => actions$),
        { provide: BasketService, useFactory: () => instance(basketServiceMock) },
        { provide: OrderService, useFactory: () => instance(orderServiceMock) },
        { provide: AddressService, useFactory: () => instance(addressServiceMock) },
      ],
    });

    effects = TestBed.get(BasketItemsEffects);
    store$ = TestBed.get(Store);
  });

  describe('addProductToBasket$', () => {
    it('should map an AddProductToBasket to an AddItemsToBasket action', () => {
      const payload = { sku: 'SKU', quantity: 1 };
      const action = new basketActions.AddProductToBasket(payload);
      const completion = new basketActions.AddItemsToBasket({ items: [payload] });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.addProductToBasket$).toBeObservable(expected$);
    });
  });

  describe('addItemsToBasket$', () => {
    beforeEach(() => {
      when(basketServiceMock.addItemsToBasket(anyString(), anything())).thenReturn(of(undefined));
    });

    it('should call the basketService for addItemsToBasket', done => {
      store$.dispatch(
        new basketActions.LoadBasketSuccess({
          basket: {
            id: 'BID',
            lineItems: [],
          } as Basket,
        })
      );

      const items = [{ sku: 'SKU', quantity: 1 }];
      const action = new basketActions.AddItemsToBasket({ items });
      actions$ = of(action);

      effects.addItemsToBasket$.subscribe(() => {
        verify(basketServiceMock.addItemsToBasket('BID', items)).once();
        done();
      });
    });

    it('should call the basketService for addItemsToBasket with specific basketId when basketId set', done => {
      store$.dispatch(
        new basketActions.LoadBasketSuccess({
          basket: {
            id: 'BID',
            lineItems: [],
          } as Basket,
        })
      );

      const items = [{ sku: 'SKU', quantity: 1 }];
      const basketId = 'BID';
      const action = new basketActions.AddItemsToBasket({ items, basketId });
      actions$ = of(action);

      effects.addItemsToBasket$.subscribe(() => {
        verify(basketServiceMock.addItemsToBasket('BID', items)).once();
        done();
      });
    });

    it('should not call the basketService for addItemsToBasket if no basket in store', () => {
      const items = [{ sku: 'SKU', quantity: 1 }];
      const action = new basketActions.AddItemsToBasket({ items });
      actions$ = of(action);

      effects.addItemsToBasket$.subscribe(fail, fail);

      verify(basketServiceMock.addItemsToBasket('BID', anything())).never();
    });

    it('should call the basketService for createBasket when no basket is present', done => {
      when(basketServiceMock.createBasket()).thenReturn(of({} as Basket));

      const items = [{ sku: 'SKU', quantity: 1 }];
      const action = new basketActions.AddItemsToBasket({ items });
      actions$ = of(action);

      effects.createBasketBeforeAddItemsToBasket$.subscribe(() => {
        verify(basketServiceMock.createBasket()).once();
        done();
      });
    });

    it('should map to action of type AddItemsToBasketSuccess', () => {
      store$.dispatch(
        new basketActions.LoadBasketSuccess({
          basket: {
            id: 'BID',
            lineItems: [],
          } as Basket,
        })
      );

      const items = [{ sku: 'SKU', quantity: 1 }];
      const action = new basketActions.AddItemsToBasket({ items });
      const completion = new basketActions.AddItemsToBasketSuccess();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.addItemsToBasket$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type AddItemsToBasketFail', () => {
      when(basketServiceMock.addItemsToBasket(anyString(), anything())).thenReturn(throwError({ message: 'invalid' }));

      store$.dispatch(
        new basketActions.LoadBasketSuccess({
          basket: {
            id: 'BID',
            lineItems: [],
          } as Basket,
        })
      );

      const items = [{ sku: 'invalid', quantity: 1 }];
      const action = new basketActions.AddItemsToBasket({ items });
      const completion = new basketActions.AddItemsToBasketFail({ error: { message: 'invalid' } as HttpError });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.addItemsToBasket$).toBeObservable(expected$);
    });
  });

  describe('loadBasketAfterAddItemsToBasket$', () => {
    it('should map to action of type LoadBasket if AddItemsToBasketSuccess action triggered', () => {
      const action = new basketActions.AddItemsToBasketSuccess();
      const completion = new basketActions.LoadBasket();
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-c', { c: completion });

      expect(effects.loadBasketAfterBasketItemsChangeSuccess$).toBeObservable(expected$);
    });
  });

  describe('updateBasketItems$', () => {
    beforeEach(() => {
      when(basketServiceMock.updateBasketItem(anyString(), anyString(), anything())).thenReturn(of());

      store$.dispatch(
        new basketActions.LoadBasketSuccess({
          basket: {
            id: 'BID',
            lineItems: [
              {
                id: 'BIID',
                name: 'NAME',
                quantity: { value: 1 },
                productSKU: 'SKU',
                price: undefined,
              } as LineItem,
            ],
          } as Basket,
        })
      );
    });

    it('should call the basketService for updateBasketItem if quantity > 0', done => {
      const payload = {
        lineItemUpdates: [
          {
            itemId: 'BIID',
            quantity: 2,
          },
          {
            itemId: 'BIID',
            quantity: 3,
          },
          {
            itemId: 'BIID',
            quantity: 4,
          },
        ],
      };
      const action = new basketActions.UpdateBasketItems(payload);
      actions$ = of(action);

      effects.updateBasketItems$.subscribe(() => {
        verify(basketServiceMock.updateBasketItem('BID', payload.lineItemUpdates[1].itemId, anything())).thrice();
        expect(capture(basketServiceMock.updateBasketItem).first()).toMatchInlineSnapshot(`
Array [
  "BID",
  "BIID",
  Object {
    "product": undefined,
    "quantity": Object {
      "value": 2,
    },
  },
]
`);
        expect(capture(basketServiceMock.updateBasketItem).second()).toMatchInlineSnapshot(`
Array [
  "BID",
  "BIID",
  Object {
    "product": undefined,
    "quantity": Object {
      "value": 3,
    },
  },
]
`);
        expect(capture(basketServiceMock.updateBasketItem).third()).toMatchInlineSnapshot(`
Array [
  "BID",
  "BIID",
  Object {
    "product": undefined,
    "quantity": Object {
      "value": 4,
    },
  },
]
`);
        done();
      });
    });

    it('should call the basketService for deleteBasketItem if quantity = 0', done => {
      when(basketServiceMock.deleteBasketItem(anyString(), anyString())).thenReturn(of());

      const payload = {
        lineItemUpdates: [
          {
            itemId: 'BIID',
            quantity: 0,
          },
        ],
      };
      const action = new basketActions.UpdateBasketItems(payload);
      actions$ = of(action);

      effects.updateBasketItems$.subscribe(() => {
        verify(basketServiceMock.deleteBasketItem('BID', payload.lineItemUpdates[0].itemId)).once();
        done();
      });
    });

    it('should map to action of type UpdateBasketItemsSuccess', () => {
      const payload = {
        lineItemUpdates: [
          {
            itemId: 'IID',
            quantity: 2,
          },
        ],
      };
      const action = new basketActions.UpdateBasketItems(payload);
      const completion = new basketActions.UpdateBasketItemsSuccess();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.updateBasketItems$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type UpdateBasketItemsFail', () => {
      when(basketServiceMock.updateBasketItem(anyString(), anyString(), anything())).thenReturn(
        throwError({ message: 'invalid' })
      );

      const payload = {
        lineItemUpdates: [
          {
            itemId: 'BIID',
            quantity: 2,
          },
        ],
      };
      const action = new basketActions.UpdateBasketItems(payload);
      const completion = new basketActions.UpdateBasketItemsFail({ error: { message: 'invalid' } as HttpError });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.updateBasketItems$).toBeObservable(expected$);
    });
  });

  describe('loadBasketAfterUpdateBasketItem$', () => {
    it('should map to action of type LoadBasket if UpdateBasketItemSuccess action triggered', () => {
      const action = new basketActions.UpdateBasketItemsSuccess();
      const completion = new basketActions.LoadBasket();
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-c', { c: completion });

      expect(effects.loadBasketAfterBasketItemsChangeSuccess$).toBeObservable(expected$);
    });
  });

  describe('deleteBasketItem$', () => {
    beforeEach(() => {
      when(basketServiceMock.deleteBasketItem(anyString(), anyString())).thenReturn(of(undefined));

      store$.dispatch(
        new basketActions.LoadBasketSuccess({
          basket: {
            id: 'BID',
            lineItems: [],
          } as Basket,
        })
      );
    });

    it('should call the basketService for DeleteBasketItem action', done => {
      const itemId = 'BIID';
      const action = new basketActions.DeleteBasketItem({ itemId });
      actions$ = of(action);

      effects.deleteBasketItem$.subscribe(() => {
        verify(basketServiceMock.deleteBasketItem('BID', 'BIID')).once();
        done();
      });
    });

    it('should map to action of type DeleteBasketItemSuccess', () => {
      const itemId = 'BIID';
      const action = new basketActions.DeleteBasketItem({ itemId });
      const completion = new basketActions.DeleteBasketItemSuccess();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.deleteBasketItem$).toBeObservable(expected$);
    });

    it('should map invalid request to action of type DeleteBasketItemFail', () => {
      when(basketServiceMock.deleteBasketItem(anyString(), anyString())).thenReturn(throwError({ message: 'invalid' }));

      const itemId = 'BIID';
      const action = new basketActions.DeleteBasketItem({ itemId });
      const completion = new basketActions.DeleteBasketItemFail({ error: { message: 'invalid' } as HttpError });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.deleteBasketItem$).toBeObservable(expected$);
    });
  });

  describe('loadBasketAfterDeleteBasketItem$', () => {
    it('should map to action of type LoadBasket if DeleteBasketItemSuccess action triggered', () => {
      const action = new basketActions.DeleteBasketItemSuccess();
      const completion = new basketActions.LoadBasket();
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.loadBasketAfterBasketItemsChangeSuccess$).toBeObservable(expected$);
    });
  });
});