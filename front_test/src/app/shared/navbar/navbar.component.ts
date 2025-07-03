import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ROUTES } from '../../sidebar/sidebar.component';
import { Router } from '@angular/router';
import { Location} from '@angular/common';

@Component({
    moduleId: module.id,
    selector: 'navbar-cmp',
    templateUrl: 'navbar.component.html'
})

export class NavbarComponent implements OnInit{
    private listTitles: any[];
    location: Location;
    private nativeElement: Node;
    private toggleButton;
    private sidebarVisible: boolean;

    public isCollapsed = true;
    @ViewChild("navbar-cmp", {static: false}) button;

    constructor(location:Location, private renderer : Renderer2, private element : ElementRef, private router: Router) {
        this.location = location;
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit(){
        this.listTitles = ROUTES.filter(listTitle => listTitle);
        var navbar : HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        this.router.events.subscribe((event) => {
          this.sidebarClose();
       });
    }
    getTitle(): string {
      let currentPath = this.location.prepareExternalUrl(this.location.path());
      if (currentPath.charAt(0) === '#') {
        currentPath = currentPath.slice(1);
      }

      // Helper to recursively search in children
      const findTitle = (routes: any[], path: string): string | null => {
        for (const route of routes) {
          if (route.path && path.startsWith(route.path)) {
            return route.title;
          }
          if (route.children) {
            const title = findTitle(route.children, path);
            if (title) return title;
          }
        }
        return null;
      };

      const foundTitle = findTitle(this.listTitles, currentPath);

      // ✅ Return route title if found, else return last segment of URL
      if (foundTitle) {
        return foundTitle;
      } else {
        const segments = currentPath.split('/');
        return segments[segments.length - 2] || 'Home';
      }
    }

    sidebarToggle() {
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
      }
      sidebarOpen() {
          const toggleButton = this.toggleButton;
          const html = document.getElementsByTagName('html')[0];
          const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];
          setTimeout(function(){
              toggleButton.classList.add('toggled');
          }, 500);

          html.classList.add('nav-open');
          if (window.innerWidth < 991) {
            mainPanel.style.position = 'fixed';
          }
          this.sidebarVisible = true;
      };
      sidebarClose() {
          const html = document.getElementsByTagName('html')[0];
          const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];
          if (window.innerWidth < 991) {
            setTimeout(function(){
              mainPanel.style.position = '';
            }, 500);
          }
          this.toggleButton.classList.remove('toggled');
          this.sidebarVisible = false;
          html.classList.remove('nav-open');
      };
      collapse(){
        this.isCollapsed = !this.isCollapsed;
        const navbar = document.getElementsByTagName('nav')[0];
        console.log(navbar);
        if (!this.isCollapsed) {
          navbar.classList.remove('navbar-transparent');
          navbar.classList.add('bg-white');
        }else{
          navbar.classList.add('navbar-transparent');
          navbar.classList.remove('bg-white');
        }

      }

      logout(): void {
        localStorage.clear(); // Or remove just the token with localStorage.removeItem('token');
        this.router.navigate(['/login']); // Redirect to login page
      }

}
