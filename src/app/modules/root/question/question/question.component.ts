import { Component, Input } from '@angular/core';
import { QuestionData } from "../question.interface";
import { QuestionService } from '../question.service';
import { AppComponentTemplate } from '@shared/component.template';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent extends AppComponentTemplate {

  @Input() data: QuestionData = {
    text: ""
  };

  constructor(private question: QuestionService) {
    super();
  }

  ngOnInit() {
  }

  yes() {
    this.question.Yes();
  }

  no() {
    this.question.No();
  }

  cancel() {
    this.question.Cancel();
  }

}
