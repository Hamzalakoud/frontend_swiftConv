import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

export interface RouteInfo {
  path?: string;
  title: string;
  icon: string;
  class: string;
  children?: RouteInfo[];
  open?: boolean;
}

export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard', icon: 'nc-bank', class: '' },
  { path: '/table', title: 'Consultation SWIFT', icon: 'nc-email-85', class: '' },
  {
    title: 'Conversion',
    icon: 'nc-refresh-69',
    class: '',
    open: false,
    children: [
      { path: '/conversion/mx-to-mt', title: 'MX → MT ', icon: 'nc-cloud-upload-94', class: '' },
      { path: '/conversion/mt-to-mx', title: 'MT → MX ', icon: 'nc-cloud-upload-94', class: '' }
    ]
  },
  {
    title: 'Configuration',
    icon: 'nc-settings-gear-65',
    class: '',
    open: false,
    children: [
      { path: '/Table-user', title: 'Gestion Users', icon: 'nc-single-02', class: '' },
      {
        title: 'Param Mapping',
        icon: 'nc-settings',
        class: '',
        open: false,
        children: [
          { path: '/Param_Mapping/mt-to-mx', title: 'MT → MX ', icon: 'nc-cloud-upload-94', class: '' },
          { path: '/Param_Mapping/mx-to-mt', title: 'MX → MT ', icon: 'nc-cloud-upload-94', class: '' }
        ]
      },
      { path: '/config/global', title: 'Param Global', icon: 'nc-world-2 ', class: '' },
      { path: '/config/param_repertoires', title: 'Param Répertoires', icon: 'nc-settings-gear-65', class: '' },
      { path: '/config/monitoring', title: 'Monitoring App', icon: 'nc-chart-bar-32', class: '' }
    ]
  }
];

@Component({
  moduleId: module.id,
  selector: 'sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  public menuItems: RouteInfo[] = [];
  private fullMenu = ROUTES;
  private userRole: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    this.menuItems = this.getMenuForRole(this.userRole);
  }

  private getMenuForRole(role: string | null): RouteInfo[] {
    if (!role) return [];

  if (role === 'admin') {
    // Admin: full menu collapsed (default open is false)
    return JSON.parse(JSON.stringify(this.fullMenu));
  }


    if (role === 'editeur') {
      // Editeur: Dashboard + Consultation SWIFT + Conversion submenu expanded
      return this.fullMenu.filter(menu => {
        if (menu.title === 'Dashboard' || menu.title === 'Consultation SWIFT') {
          return true;
        }
        if (menu.title === 'Conversion') {
          return true;
        }
        return false;
      }).map(menu => {
        if (menu.title === 'Conversion') {
          menu.open = true; // open submenu
        }
        return menu;
      });
    }

    if (role === 'viewer') {
      // Viewer: Dashboard + Consultation SWIFT only (no Conversion)
      return this.fullMenu.filter(menu => menu.title === 'Dashboard' || menu.title === 'Consultation SWIFT');
    }

    // Fallback: empty menu
    return [];
  }

  private expandAll(menu: RouteInfo) {
    menu.open = true;
    if (menu.children) {
      menu.children.forEach(child => this.expandAll(child));
    }
  }

  toggleCollapse(menu: RouteInfo) {
    menu.open = !menu.open;
  }
}
