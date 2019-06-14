import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';

import { PipesModule } from 'ish-core/pipes.module';
import { PromotionDetailsComponent } from '../../../promotion/components/promotion-details/promotion-details.component';

import { ProductPromotionComponent } from './product-promotion.component';

describe('Product Promotion Component', () => {
  let component: ProductPromotionComponent;
  let fixture: ComponentFixture<ProductPromotionComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MockComponent(PromotionDetailsComponent), ProductPromotionComponent],
      imports: [PipesModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPromotionComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    component.promotions = [
      {
        id: 'PROMO_UUID',
        name: 'MyPromotion',
        couponCodeRequired: false,
        currency: 'EUR',
        promotionType: 'MyPromotionType',
        description: 'MyPromotionDescription',
        legalContentMessage: 'MyPromotionContentMessage',
        longTitle: 'MyPromotionLongTitle',
        ruleDescription: 'MyPromotionRuleDescription',
        title: 'MyPromotionTitle',
        useExternalUrl: false,
        disableMessages: false,
      },
    ];
    component.displayType = 'list';
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should display the promotion title for the given promotion', () => {
    expect(element.querySelector('.promotion-short-title').textContent).toContain(component.promotions[0].title);
  });
});