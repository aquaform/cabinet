import { Component } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent extends AppComponentTemplate {

  activity: string;
  title: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    super();
  }

  ngOnInit() {
    this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.activity = params.activity;
    });
  }

  getTitle(title: string) {
    this.title = title;
  }

  goToEducation() {
    this.router.navigate(['/education']);
  }

}
