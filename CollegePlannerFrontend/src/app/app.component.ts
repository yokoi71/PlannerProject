import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  //title = 'bank-app-ui';

  constructor() {}

  ngOnInit() {
    // No longer need to fetch CSRF token on startup
    // Tokens are now fetched fresh for each state-changing request
  }
}
