import { BasketRebate } from '../basket-rebate/basket-rebate.model';
import { Price } from '../price/price.model';
import { Product } from '../product/product.model';

export interface LineItem {
  id: string;
  position: number;
  quantity: {
    type?: string;
    value: number;
    unit?: string;
  };
  productSKU: string;
  price: Price;
  singleBasePrice: Price;
  itemSurcharges?: {
    amount: Price;
    description?: string;
    displayName?: string;
    text?: string;
  }[];
  valueRebates?: BasketRebate[];
  totals: {
    salesTaxTotal?: Price;
    shippingTaxTotal?: Price;
    shippingTotal: Price;
    total: Price;
    valueRebatesTotal?: Price;
  };
  isHiddenGift: boolean;
  isFreeGift: boolean;

  // attributes needed for order line items
  name?: string;
  inStock?: boolean;
  availability?: boolean;
}

export interface LineItemView extends LineItem {
  product: Product;
}