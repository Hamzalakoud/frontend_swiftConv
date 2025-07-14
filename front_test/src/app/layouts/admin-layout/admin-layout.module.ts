import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminLayoutRoutes } from './admin-layout.routing';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { TypographyComponent } from '../../pages/typography/typography.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { TableUserComponent } from '../../pages/table-user/table-user';
import { NotificationsComponent } from '../../pages/notifications/notifications.component';
import { UpgradeComponent } from '../../pages/upgrade/upgrade.component';
import { MsgViewerComponent } from 'app/pages/msg-viewer/msg-viewer.component';
import { HttpClientModule } from '@angular/common/http';

import { TableComponent } from '../../pages/table/table.component'; 

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserViewerComponent } from 'app/pages/user-viewer/user-viewer.component';
import { MappingMtToMxComponent } from 'app/pages/mapping-mt-to-mx/mapping-mt-to-mx.component';
import { MappingMxToMtComponent } from 'app/pages/mapping-mx-to-mt/mapping-mx-to-mt.component';
import { ScParamGlobalComponent } from 'app/pages/sc-param-global/sc-param-global.component';
import { ScMappingDirectoryComponent } from 'app/pages/sc-mapping-directory/sc-mapping-directory.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    HttpClientModule
    
  ],
  declarations: [
    DashboardComponent,
    TableComponent,
    TableUserComponent,
    UpgradeComponent,
    TypographyComponent,
    IconsComponent,
    TableUserComponent,
    NotificationsComponent,
    MsgViewerComponent,
    MappingMtToMxComponent,
    MappingMxToMtComponent,
    ScParamGlobalComponent,
    UserViewerComponent,
    ScMappingDirectoryComponent,
    
  ]
})
export class AdminLayoutModule {}
