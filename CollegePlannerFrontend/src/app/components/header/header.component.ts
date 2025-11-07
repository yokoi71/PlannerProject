import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  user = new User();
  isMobileMenuOpen = false;

  constructor() {}

  ngOnInit() {
    if (sessionStorage.getItem('userdetails')) {
      this.user = JSON.parse(sessionStorage.getItem('userdetails')!);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
