import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClientXsrfModule,
} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ContactComponent } from './components/contact/contact.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LogoutComponent } from './components/logout/logout.component';
import { NoticesComponent } from './components/notices/notices.component';
import { AccountComponent } from './components/account/account.component';
import { BalanceComponent } from './components/balance/balance.component';
import { LoansComponent } from './components/loans/loans.component';
import { CardsComponent } from './components/cards/cards.component';
import { XhrInterceptor } from './interceptors/app.request.interceptor';
import { AuthActivateRouteGuard } from './routeguards/auth.routeguard';
import { HomeComponent } from './components/home/home.component';
import { StudentinfoComponent } from './components/studentinfo/studentinfo.component';
import { ClassScheduleComponent } from './components/classSchedule/classSchedule.component';
import { AddClassComponent } from './components/add-class/add-class.component';
import { DeleteClassDialogComponent } from './components/classSchedule/delete-class-dialog.component';
import { UpdateClassDialogComponent } from './components/classSchedule/update-class-dialog.component';
import { WeeklyScheduleComponent } from './components/weekly-schedule/weekly-schedule.component';
import { SemesterSetupComponent } from './components/semester-setup/semester-setup/semester-setup.component';
import { CourseAssignmentExamSetupComponent } from './components/course-assignment-exam-setup/course-assignment-exam-setup.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ContactComponent,
    LoginComponent,
    DashboardComponent,
    LogoutComponent,
    NoticesComponent,
    AccountComponent,
    BalanceComponent,
    LoansComponent,
    CardsComponent,
    HomeComponent,
    StudentinfoComponent,
    ClassScheduleComponent,
    AddClassComponent,
    DeleteClassDialogComponent,
    UpdateClassDialogComponent,
    WeeklyScheduleComponent,
    SemesterSetupComponent,
    CourseAssignmentExamSetupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: XhrInterceptor,
      multi: true,
    },
    AuthActivateRouteGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
