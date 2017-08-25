import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ProductListService } from './product-list-service';
import { CacheCustomService } from '../../../shared/services/cache/cache-custom.service';
import { ProductTileModel } from '../../../shared/components/product-tile/product-tile.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'is-familypagelist',
  templateUrl: './family-page-list.component.html',
  styleUrls: ['./family-page-list.component.css']
})

export class FamilyPageListComponent implements OnInit, OnChanges {
  @Input() isListView;
  @Input() sortBy;
  @Output() totalItems: EventEmitter<number> = new EventEmitter();
  thumbnailKey = 'thumbnailKey';
  AllCategories: 'AllCategories';
  allData: any;
  thumbnails: ProductTileModel[] = [];
  filteredData;


  /**
   * Construcotr
   * @param  {ProductListService} privateproductListService
   * @param  {CacheCustomService} privatecustomService
   */
  constructor(
    private productListService: ProductListService,
    private customService: CacheCustomService) {
  };


  ngOnChanges() {
    /**
     * Sorts the Products either Ascending or Descending
     */
    this.thumbnails.sort((a, b) => {
      if (this.sortBy === 'name-asc') {
        if (a.name > b.name) {
          return 1
        } else if (a.name === b.name) {
          return 0
        } else {
          return -1
        }
      } else if (this.sortBy === 'name-desc') {
        if (a.name > b.name) {
          return -1
        } else if (a.name === b.name) {
          return 0
        } else {
          return 1
        }
      }
    })
  };

  /*
  * Gets the data from Cache and shows products
   */
  ngOnInit() {
    if (this.customService.cacheKeyExists(this.thumbnailKey)) {
      this.thumbnails = this.customService.getCachedData(this.thumbnailKey, true);
      this.totalItems.emit(this.thumbnails.length);
    } else {
      this.productListService.getProductList().subscribe((data: ProductTileModel[]) => {
        this.allData = data;
        if (environment.needMock) {
          this.thumbnails = this.allData[0]['Cameras'];
        } else {
          this.thumbnails.push(this.allData);
        }
        this.totalItems.emit(this.thumbnails.length);
        this.customService.storeDataToCache(this.thumbnails, this.thumbnailKey, true);
      });
    };

  };
};