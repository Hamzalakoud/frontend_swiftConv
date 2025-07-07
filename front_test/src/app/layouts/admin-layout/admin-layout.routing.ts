import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { UserComponent } from '../../pages/user/user.component';
import { TypographyComponent } from '../../pages/typography/typography.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { TableUserComponent } from '../../pages/table-user/table-user';
import { NotificationsComponent } from '../../pages/notifications/notifications.component';
import { UpgradeComponent } from '../../pages/upgrade/upgrade.component';

import { authGuard } from '../../services/auth.guard'; // Adjust path if needed
import { MsgViewerComponent } from 'app/pages/msg-viewer/msg-viewer.component';
import { UserViewerComponent } from 'app/pages/user-viewer/user-viewer.component';

import { TableComponent} from '../../pages/table/table.component';
import { MappingMtToMxComponent } from '../../pages/mapping-mt-to-mx/mapping-mt-to-mx.component';
import { MappingMxToMtComponent } from 'app/pages/mapping-mx-to-mt/mapping-mx-to-mt.component';
import { ScParamGlobalComponent } from 'app/pages/sc-param-global/sc-param-global.component';
import { ScMappingDirectoryComponent } from 'app/pages/sc-mapping-directory/sc-mapping-directory.component';
import { MtMxConverterComponent } from 'app/pages/mt-mx-converter/mt-mx-converter.component';
import { MxMtConverterComponent } from 'app/pages/mx-mt-converter/mx-mt-converter.component';

export const AdminLayoutRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'user', component: UserComponent, canActivate: [authGuard] },
  { path: 'table', component: TableComponent, canActivate: [authGuard] },
  { path: 'typography', component: TypographyComponent, canActivate: [authGuard] },
  { path: 'icons', component: IconsComponent, canActivate: [authGuard] },
  { path: 'Table-user', component: TableUserComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
  { path: 'upgrade', component: UpgradeComponent, canActivate: [authGuard] },
  { path: 'msg-viewer/:id', component: MsgViewerComponent, canActivate: [authGuard] },
  { path: 'user-viewer/:id', component: UserViewerComponent, canActivate: [authGuard] },
  { path: 'Param_Mapping/mt-to-mx',component: MappingMtToMxComponent , canActivate: [authGuard]},
  { path: 'Param_Mapping/mx-to-mt', component: MappingMxToMtComponent, canActivate: [authGuard] },
  { path: 'config/global', component: ScParamGlobalComponent, canActivate: [authGuard] },
  { path: 'config/param_repertoires', component: ScMappingDirectoryComponent, canActivate: [authGuard] },
  { path: 'conversion/mt-to-mx', component: MtMxConverterComponent, canActivate: [authGuard] },
  { path: 'conversion/mx-to-mt', component: MxMtConverterComponent, canActivate: [authGuard] },

      //{ path: '/config/param_repertoires', title: 'Param Global', icon: 'nc-world-2', class: '' },/config/param_repertoires

];
