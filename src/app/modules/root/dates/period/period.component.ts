import { Component, OnInit, Input } from '@angular/core';
import * as dayjs from 'dayjs';
import { DatesTools } from '@modules/root/dates/dates.class';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss']
})
export class PeriodComponent implements OnInit {

  // Если передать одну дату, как начало и конец,
  // то будет показана только эта дата. Это используется
  // для вывода одиночных дат.
  @Input() start: Date;
  @Input() end: Date;

  // Показать временную зону
  @Input() displayTimezone = false;

  // Переносить текст
  @Input() wrap = false;

  // Замена фраз с... по...
  @Input() startTitle = "DATES.STARTING";
  @Input() endTitle = "DATES.ENDING";
  @Input() timeTitle = "";

  // Используется, когда не следует сокращать период до одной даты,
  // даже если он попадает в одни сутки. При этом всегда
  // если время соответствует началу или концу дня, то оно не показывается.
  @Input() alwaysDisplayTitles = false;

  // Будет показана фраза перед временем для дата окончания.
  @Input() displayEndTimeTitle = false;

  // Если передать hideTime в явном виде, то время не будет показано,
  // но следует учесть, что при переходе в другие часовые пояса сместятся и сутки.
  // Не следует скрывать время для случаев, где важно время.
  @Input() hideTime = false;

  // Служебные функции получения дат начала и окончания нужны,
  // чтобы не изменять неявно объекты start и end по ссылке.

  get startDate() {
    if (DatesTools.IsEmptyDate(this.start)) {
      return new Date(0);
    }
    return new Date(this.start.getTime());
  }

  get endDate(): Date {
    if (DatesTools.IsEmptyDate(this.end)) {
      return new Date(0);
    }
    return new Date(this.end.getTime());
  }

  singleDate: {
    date: string;
  } = null;

  singleDateAndSingleTime: {
    date: string;
    time: string;
  } = null;

  singleDateAndMultipleTime: {
    date: string;
    startTime: string;
    endTime: string;
  } = null;

  fromSingleDate: {
    date: string;
  } = null;

  multipleDatesAndTitle: {
    start: string;
    end: string;
    startTime: string;
    endTime: string
  } = null;

  startSingleDateAndTitle: {
    date: string;
    time: string;
  } = null;

  endSingleDateAndTitle: {
    date: string;
    time: string;
  } = null;

  timezone = DatesTools.timezone(this.translate);

  isTime = true;

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {

    if (DatesTools.IsEmptyDate(this.startDate) && DatesTools.IsEmptyDate(this.endDate)) {
      return '';
    }

    if (!DatesTools.IsEmptyDate(this.startDate) && !DatesTools.IsEmptyDate(this.endDate)) {

      if ((this.endDate.getTime() - this.startDate.getTime() <= 86400000)
        && DatesTools.startDay(this.startDate).getTime() === DatesTools.startDay(this.endDate).getTime()
        && !this.alwaysDisplayTitles) {

        if (this.endDate.getTime() - this.startDate.getTime() >= 86399000 && this.hideTime) {

          this.singleDate = {
            date: dayjs(this.startDate).format('LL')
          };

          this.isTime = false;

        } else {

          if (this.startDate.getTime() === this.endDate.getTime()) {

            if (this.hideTime) {
              this.singleDate = {
                date: dayjs(this.startDate).format('LL')
              };
              this.isTime = false;
            } else {
              this.singleDateAndSingleTime = {
                date: dayjs(this.startDate).format('LL'),
                time: dayjs(this.startDate).format('HH:mm')
              };
            }

          } else {

            this.singleDateAndMultipleTime = {
              date: dayjs(this.startDate).format('LL'),
              startTime: dayjs(this.startDate).format('HH:mm'),
              endTime: dayjs(this.endDate).format('HH:mm'),
            };

          }

        }

      } else {

        let endDate = this.endDate;

        if (this.hideTime && (endDate.getTime() - this.start.getTime()) % 86400000 === 0) {
          endDate = new Date(endDate.getTime() - 1000); // Убираем секунду, чтобы не вылезать в следующие сутки
        }

        if (this.startDate.getTime() === endDate.getTime() && !this.alwaysDisplayTitles) {
          if ((DatesTools.isStartDay(this.startDate) || DatesTools.isEndDay(this.startDate))) {
            this.fromSingleDate = {
              date: dayjs(this.startDate).format('LL'),
            };
            this.isTime = false;
          } else {
            this.fromSingleDate = {
              date: dayjs(this.startDate).format('LLL'),
            };
          }

        } else {
          this.multipleDatesAndTitle = {
            start: dayjs(this.startDate).format('LL'),
            end: dayjs(endDate).format('LL'),
            startTime: DatesTools.isStartDay(this.startDate) ? "" : dayjs(this.startDate).format('HH:mm'),
            endTime: DatesTools.isEndDay(endDate) ? "" : dayjs(endDate).format('HH:mm'),
          };
          if (!this.multipleDatesAndTitle.startTime && !this.multipleDatesAndTitle.endTime) {
            this.isTime = false;
          }
        }

      }

    } else {

      if (!DatesTools.IsEmptyDate(this.startDate)) {
        if (DatesTools.isStartDay(this.startDate)) {
          this.startSingleDateAndTitle = {
            date: dayjs(this.startDate).format('LL'),
            time: "",
          };
          this.isTime = false;
        } else {
          this.startSingleDateAndTitle = {
            date: dayjs(this.startDate).format('LL'),
            time: dayjs(this.startDate).format('HH:mm'),
          };
        }

      }

      if (!DatesTools.IsEmptyDate(this.endDate)) {
        if (DatesTools.isEndDay(this.endDate)) {
          this.endSingleDateAndTitle = {
            date: dayjs(this.endDate).format('LL'),
            time:  "",
          };
          this.isTime = false;
        } else {
          this.endSingleDateAndTitle = {
            date: dayjs(this.endDate).format('LL'),
            time: dayjs(this.endDate).format('HH:mm'),
          };
        }

      }

    }

  }

}

