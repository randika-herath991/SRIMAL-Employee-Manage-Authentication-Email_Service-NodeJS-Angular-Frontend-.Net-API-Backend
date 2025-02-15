import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'EmployeeManager.UI';
  url = "";

  today = new Date();

  showNavbar: boolean = true;
  navbarOpen: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;
        this.url = this.url.substr(0, this.url.lastIndexOf('/'));
      }
    })
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showNavbar = this.router.url !== '/' && this.router.url !== '/forgotpassword';
      if (this.router.url === '/employees') {
        this.startLoggingTime();
      }
    });
  }

  ngAfterViewInit() {
  }

  startLoggingTime() {
    setInterval(() => {
      this.today = new Date();
      console.log(this.today);
    }, 1000);
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  btnBack() {
    this.router.navigateByUrl('employees');
  };

  onLogout() {
    this.router.navigate(['/']);
  }
}