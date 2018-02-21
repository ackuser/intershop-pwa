import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from '../../../../dev-utils/mock.component';
import { Product } from '../../../../models/product/product.model';
import { ProductListComponent } from './product-list.component';

describe('Product List Component', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProductListComponent,
        MockComponent({ selector: 'ish-product-tile', template: 'Product Tile Component', inputs: ['product'] }),
        MockComponent({ selector: 'ish-product-row', template: 'Product Row Component', inputs: ['product'] }),
        MockComponent({ selector: 'ish-loading', template: 'Loading Component' }),
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    component.products = [new Product('SKU')];
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(function() { fixture.detectChanges(); }).not.toThrow();
  });

  it('should check if one product tile (viewType = grid) is rendered', () => {
    component.viewType = 'grid';
    fixture.detectChanges();
    const thumbs = element.querySelectorAll('ish-product-tile');
    expect(thumbs.length).toBe(1);
  });

  it('should check if one product row (viewType = list) is rendered', () => {
    component.viewType = 'list';
    fixture.detectChanges();
    const thumbs = element.querySelectorAll('ish-product-row');
    expect(thumbs.length).toBe(1);
  });
});
