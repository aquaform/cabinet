import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { routesExtended } from '@pages/extended-pages.interface';

const routes: Routes = [
  {path: "", redirectTo: 'start', pathMatch: 'full'},
  {path: "start", loadChildren: () => import('./pages/start/start.module').then(m => m.StartModule)},
  {path: "auth", loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)},

  // Для совместимости с ссылкой ВК 2.0:
  {path: "changePassword",loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)},

  {path: "calendar", loadChildren: () => import('./pages/calendar/calendar.module').then(m => m.CalendarPageModule)},
  {path: "education", loadChildren: () => import('./pages/education/education.module').then(m => m.EducationModule)},
  {path: "forum", loadChildren: () => import('./pages/forum/forum.module').then(m => m.ForumPageModule)},
  {path: "library", loadChildren: () => import('./pages/library/library.module').then(m => m.LibraryPageModule)},
  {path: "messages", loadChildren: () => import('./pages/messages/messages.module').then(m => m.MessagesPageModule)},
  {path: "profile", loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)},
  {path: "teaching", loadChildren: () => import('./pages/teaching/teaching.module').then(m => m.TeachingModule)},
  {path: "course", loadChildren: () => import('./pages/course/course.module').then(m => m.CoursePageModule)},
  {path: "more", loadChildren: () => import('./pages/more/more.module').then(m => m.MoreModule)},
  ...routesExtended,
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
