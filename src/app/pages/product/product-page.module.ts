import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { ProductDetailActionsComponent } from './components/product-detail-actions/product-detail-actions.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductImagesComponent } from './components/product-images/product-images.component';
import { ProductVariationsComponent } from './components/product-variations/product-variations.component';
import { ProductVariationsContainerComponent } from './containers/product-variations/product-variations.container';
import { ProductPageContainerComponent } from './product-page.container';

const productPageRoutes: Routes = [
  {
    path: ':sku',
    children: [
      {
        path: '**',
        component: ProductPageContainerComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(productPageRoutes), SharedModule],
  declarations: [
    ProductDetailActionsComponent,
    ProductDetailComponent,
    ProductImagesComponent,
    ProductPageContainerComponent,
    ProductVariationsComponent,
    ProductVariationsContainerComponent,
  ],
})
export class ProductPageModule {}
