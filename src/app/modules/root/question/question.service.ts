import { Injectable } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { Subject, Observable } from 'rxjs';
import { QuestionAnswer, QuestionData, questionAnswers } from './question.interface';
import { modalComponentNames } from '../modal/modal.interface';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  answer: Subject<QuestionAnswer>;

  constructor(private modal: ModalService) {
    this.modal.OnChangeVisibility$.subscribe(
      (item) => {
        if (!item && this.answer) {
          this.Cancel();
        }
      }
    );
  }

  Open(data: QuestionData): Observable<QuestionAnswer> {
    if (this.answer) {
      this.Cancel();
    }
    this.answer = new Subject<QuestionAnswer>();
    this.modal.Display({
      component: modalComponentNames.question,
      data: data,
      maximizeSize: false
    });
    return this.answer.asObservable();
  }

  Yes() {
    if (this.answer) {
      this.answer.next(questionAnswers.yes);
    }
    this.close();
  }

  No() {
    if (this.answer) {
      this.answer.next(questionAnswers.no);
    }
    this.close();
  }

  Cancel() {
    if (this.answer) {
      this.answer.next(questionAnswers.cancel);
    }
    this.close();
  }

  close() {
    if (this.answer) {
      this.answer.complete();
    }
    this.answer = null;
    this.modal.Close();
  }

}
