import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model/user.model';
import { NgForm } from '@angular/forms';
import { LoginService } from 'src/app/services/login/login.service';
import { Router } from '@angular/router';
import { getCookie } from 'typescript-cookie';
import { CsrfService } from 'src/app/services/csrf.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  authStatus: string = '';
  model = new User();

  constructor(
    private loginService: LoginService,
    private router: Router,
    private csrfService: CsrfService
  ) {}

  ngOnInit(): void {}

  validateUser(loginForm: NgForm) {
    this.loginService
      .validateLoginDetails(this.model)
      .subscribe((responseData) => {
        //jwt related
        window.sessionStorage.setItem(
          'Authorization',
          responseData.headers.get('Authorization')!
        );

        this.model = <any>responseData.body;
        this.model.authStatus = 'AUTH';
        window.sessionStorage.setItem(
          'userdetails',
          JSON.stringify(this.model)
        );

        // Only update CSRF token if we find a valid one in cookies
        let xsrf = getCookie('XSRF-TOKEN');
        if (xsrf) {
          this.csrfService.storeCsrfToken(xsrf);
          console.log('LoginComponent: Updated XSRF-TOKEN = ' + xsrf);
        } else {
          console.log(
            'LoginComponent: No XSRF-TOKEN found in cookies, keeping existing token'
          );
        }

        this.router.navigate(['dashboard']);
      });
  }
}
