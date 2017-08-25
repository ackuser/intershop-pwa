import { ComponentFixture } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { TestBed } from '@angular/core/testing';
import { AccountLoginMockService, AccountLoginService } from './account-login-service';
import { InstanceService } from '../../shared/services/instance.service';
import { CacheCustomService } from '../../shared/services/cache/cache-custom.service';
import { CacheService } from 'ng2-cache/ng2-cache';
import { EncryptDecryptService } from '../../shared/services/cache/encrypt-decrypt.service';
import { JwtService } from '../../shared/services/jwt.service';
import { AccountLoginComponent } from './account-login.component';
import { inject, async } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { userData } from './account-login.mock';
import { SharedModule } from '../../shared/shared-modules/shared.module';
import { RouterTestingModule } from '@angular/router/testing';


describe('AccountLogin Component', () => {
    let fixture: ComponentFixture<AccountLoginComponent>,
        component: AccountLoginComponent,
        element: HTMLElement,
        debugEl: DebugElement,
        navSpy;
    class MockAccountLoginService {
        singinUser(userDetails) {
            if (userDetails.userName === 'intershop@123.com' && userDetails.password === '123456') {
                return Observable.of(userData);
            } else {
                return Observable.of('Incorrect Credentials');
            }
        }
    }

    class RouterStub {
        public navigate(url: string[]) {
            return url;
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AccountLoginComponent
            ],
            providers: [
                CacheCustomService, CacheService, EncryptDecryptService,
                { provide: AccountLoginService, useClass: MockAccountLoginService }
            ],
            imports: [
                SharedModule,
                TranslateModule.forRoot(),
                RouterTestingModule
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }))

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountLoginComponent);
        component = fixture.componentInstance;
        debugEl = fixture.debugElement;
        element = fixture.nativeElement;
        const router = TestBed.get(Router);
        this.navSpy = spyOn(router, 'navigate');
    })

    it('should check if controls are rendered on Login page', () => {
        expect(element.querySelector('#ShopLoginForm_Login')).toBeDefined();
        expect(element.querySelector('#ShopLoginForm_Password')).toBeDefined();
        expect(element.getElementsByClassName('btn btn-primary')).toBeDefined();
    });

    it(`should call onSignIn when loginForm is invalid`, () => {
        component.ngOnInit();
        const userDetails = { userName: 'intershop@123.com', password: '123456' };
        component.onSignin(userDetails);
        expect(this.navSpy).not.toHaveBeenCalled();
    })

    it(`should call onSignIn when loginForm is valid but credentials are incorrect`, () => {
        component.ngOnInit();
        const userDetails = { userName: 'intershop@123.com', password: 'wrong' };
        component.loginForm.controls['userName'].setValue('test@test.com');
        component.loginForm.controls['password'].setValue('123213');
        component.onSignin(userDetails);
        expect(component.errorUser).toEqual('Incorrect Credentials');
    })

    it(`should call onSignIn when loginForm is valid with correct credentials`, () => {
        component.ngOnInit();
        const userDetails = { userName: 'intershop@123.com', password: '123456' };
        component.loginForm.controls['userName'].setValue('test@test.com');
        component.loginForm.controls['password'].setValue('123213');
        component.onSignin(userDetails);
        expect(this.navSpy).toHaveBeenCalledWith(['home']);
    })

    it('should call ngOnInit method', () => {
        component.ngOnInit();
        expect(component.loginForm).toBeDefined();
    })

    it('should assign value to Email field to test Email validator', () => {
        component.ngOnInit();
        component.loginForm.controls['userName'].setValue('test@test.com');
        expect(component.loginForm.controls['userName'].value).toEqual('test@test.com');
    })
});