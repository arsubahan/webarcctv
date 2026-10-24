import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './arcctv/home/home.component';
import { NgModule } from '@angular/core';
import { ClhomeComponent } from './arcctv/clhome/clhome.component';
import { ClprofileComponent } from './arcctv/clprofile/clprofile.component';
import { ClcameraComponent } from './arcctv/clcamera/clcamera.component';
import { LoginComponent } from './arcctv/login/login.component';
import { LocationflComponent } from './arcctv/maintain/locationfl/locationfl.component';
import { VideotypeComponent } from './arcctv/maintain/videotype/videotype.component';
import { SignupComponent } from './arcctv/maintain/signup/signup.component';
import { configComponent } from './arcctv/maintain/config/config.component';

import { AuthGuard } from './arcctv/authguard';
import { ClviewmotionComponent } from './arcctv/clviewmotion/clviewmotion.component';
import { DashboardComponent } from './arcctv/dashboard/dashboard.component';
import { WvloginComponent } from './arcctv/wvlogin/wvlogin.component';
import { WvhomeComponent } from './arcctv/wvhome/wvhome.component';


export const routes: Routes = [
  { path: 'arcctv/home', component: HomeComponent },
  { path: 'arcctv', redirectTo: 'arcctv/home', pathMatch: 'full' },
  { path: 'home', redirectTo: 'arcctv/home', pathMatch: 'full' },
  { path: '', redirectTo: 'arcctv/home', pathMatch: 'full' },
  {
    path: 'arcctv/clhome', component: ClhomeComponent,
    canActivate: [AuthGuard],
  },

  { path: 'clhome', redirectTo: 'arcctv/clhome', pathMatch: 'full' },

  {
    path: 'arcctv/clprofile', component: ClprofileComponent,
    canActivate: [AuthGuard],
  },
  { path: 'clprofile', redirectTo: 'arcctv/clprofile', pathMatch: 'full' },

  {
    path: 'arcctv/clcamera', component: ClcameraComponent,
    canActivate: [AuthGuard],
  },
  { path: 'clcamera', redirectTo: 'arcctv/clcamera', pathMatch: 'full' },

  {
    path: 'arcctv/clviewmotion', component: ClviewmotionComponent,
    canActivate: [AuthGuard],
  },
  { path: 'clviewmotion', redirectTo: 'arcctv/clviewmotion', pathMatch: 'full' },


  {
    path: 'arcctv/dashboard', component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'dashboard', redirectTo: 'arcctv/dashboard', pathMatch: 'full' },

  { path: 'arcctv/login', component: LoginComponent },
  { path: 'login', redirectTo: 'arcctv/login', pathMatch: 'full' },

  {
    path: 'arcctv/maintain/locationfl', component: LocationflComponent,
    canActivate: [AuthGuard],
  },
  { path: 'maintain/locationfl', redirectTo: 'arcctv/maintain/locationfl', pathMatch: 'full' },
  { path: 'locationfl', redirectTo: 'arcctv/maintain/locationfl', pathMatch: 'full' },

  {
    path: 'arcctv/maintain/locationfl', component: LocationflComponent,
    canActivate: [AuthGuard],
  },
  { path: 'maintain/locationfl', redirectTo: 'arcctv/maintain/locationfl', pathMatch: 'full' },
  { path: 'locationfl', redirectTo: 'arcctv/maintain/locationfl', pathMatch: 'full' },

  {
    path: 'arcctv/maintain/videotype', component: VideotypeComponent,
    canActivate: [AuthGuard],
  },
  { path: 'maintain/videotype', redirectTo: 'arcctv/maintain/videotype', pathMatch: 'full' },
  { path: 'videotype', redirectTo: 'arcctv/maintain/videotype', pathMatch: 'full' },
  {
    path: 'arcctv/maintain/config', component: configComponent,
    canActivate: [AuthGuard],
  },
  { path: 'maintain/config', redirectTo: 'arcctv/maintain/config', pathMatch: 'full' },
  { path: 'config', redirectTo: 'arcctv/maintain/config', pathMatch: 'full' },

  { path: 'arcctv/maintain/signup', component: SignupComponent },
  { path: 'arcctv/maintain/signup', redirectTo: 'arcctv/maintain/signup', pathMatch: 'full' },
  { path: 'signup', redirectTo: 'arcctv/maintain/signup', pathMatch: 'full' },

  { path: 'arcctv/wvlogin', component: WvloginComponent },
  { path: 'wvlogin', redirectTo: 'arcctv/wvlogin', pathMatch: 'full' },

  {
    path: 'arcctv/wvhome', component: WvhomeComponent,
    canActivate: [AuthGuard],
  },
  { path: 'wvhome', redirectTo: 'arcctv/wvhome', pathMatch: 'full' },
  
  


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoute { }
