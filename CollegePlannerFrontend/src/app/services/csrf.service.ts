import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CsrfService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getCsrfToken(): Observable<string> {
    return this.http.get(`${this.baseUrl}/csrf-token`, {
      responseType: 'text',
    });
  }

  storeCsrfToken(token: string): void {
    console.log('Csrf Token is stored: ', token);
    console.log(
      'SessionStorage before storing:',
      sessionStorage.getItem('XSRF-TOKEN')
    );
    sessionStorage.setItem('XSRF-TOKEN', token);
    console.log(
      'SessionStorage after storing:',
      sessionStorage.getItem('XSRF-TOKEN')
    );
  }

  getStoredCsrfToken(): string | null {
    const token = sessionStorage.getItem('XSRF-TOKEN');
    console.log('getStoredCsrfToken is called. Token:', token);
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
    console.log('Direct sessionStorage access:', sessionStorage['XSRF-TOKEN']);
    console.log('SessionStorage length:', sessionStorage.length);

    // Try to get all items to see what's actually there
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key!);
      console.log(`SessionStorage item ${i}: ${key} = ${value}`);
    }

    return token;
  }

  /**
   * Utility method to extract and store CSRF token from HTTP response cookies
   * Can be used with .pipe() in HTTP requests
   */
  extractAndStoreCsrfToken() {
    return tap((resData: HttpResponse<any>) => {
      // Check for CSRF token in cookies since backend uses CookieCsrfTokenRepository
      const xsrfCookie = document.cookie
        .split(';')
        .find((c) => c.trim().startsWith('XSRF-TOKEN='));

      if (xsrfCookie) {
        const csrfToken = xsrfCookie.split('=')[1];
        console.log('Found CSRF token in cookie:', csrfToken);
        this.storeCsrfToken(csrfToken);
      } else {
        console.log('No CSRF token found in cookies');
      }
    });
  }

  /**
   * For cookie-based CSRF, we don't need to manually add headers
   * The browser will automatically send the XSRF-TOKEN cookie with requests
   * when withCredentials: true is set
   */
  withCookieBasedCsrf<T>(requestFn: () => Observable<T>): Observable<T> {
    // First get a fresh CSRF token to ensure the cookie is set
    return this.getCsrfToken().pipe(
      tap((token) => {
        console.log('Got fresh CSRF token for cookie-based approach:', token);
        // The backend will automatically set the XSRF-TOKEN cookie
        // No need to manually add headers
      }),
      switchMap(() => requestFn())
    );
  }
}
