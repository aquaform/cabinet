import { Component, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { FileComponentInputData } from '../file.interface';
import { AlertService } from '@modules/root/alert/alert.service';
import { DatesTools } from '@modules/root/dates/dates.class';

@Component({
  selector: 'app-file-window',
  templateUrl: './file-window.component.html',
  styleUrls: ['./file-window.component.scss']
})
export class FileWindowComponent extends AppComponentTemplate implements AfterViewInit {

  @Input() data: FileComponentInputData = {
    path: "",
    name: "",
    isAudio: false,
    isVideo: false,
    isImage: false,
    isPDF: false,
    isHTML: false
  };

  @ViewChild('video') videoElement: ElementRef;
  availablePlaybackRate = false;
  displayPlaybackRate = false;
  futurePlaybackRateVisibility: boolean | null = null;
  currentPlaybackRate = 1;
  playbackRateTimer: NodeJS.Timer;
  hidePlaybackRateAfterSecond = 2.5 * 1000;
  lastMouseMove: Date;

  constructor(
    private alert: AlertService,
    private cd: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit() {
    if (this.videoElement && this.videoElement.nativeElement
      && "playbackRate" in this.videoElement.nativeElement) {
      this.availablePlaybackRate = true;
      this.currentPlaybackRate = this.videoElement.nativeElement.playbackRate;
      this.setPlaybackRateVisibility(true);
      this.onVideoMouseMove();
      this.playbackRateTimer = setInterval(
        () => this.changePlaybackRateVisibility(), 150);
      this.cd.detectChanges(); // Обязательно
    }
  }

  close() {
    this.alert.Close();
  }

  setPlaybackRate(rate: number) {
    this.videoElement.nativeElement.playbackRate = rate;
    this.currentPlaybackRate = this.videoElement.nativeElement.playbackRate;
  }

  changePlaybackRateVisibility() {
    if (typeof this.futurePlaybackRateVisibility === 'boolean') {
      this.displayPlaybackRate = this.futurePlaybackRateVisibility;
      this.futurePlaybackRateVisibility = null;
    }
    const idleTime = DatesTools.IsEmptyDate(this.lastMouseMove) ? 0 : (new Date()).getTime() - this.lastMouseMove.getTime();
    if (idleTime > this.hidePlaybackRateAfterSecond) {
      this.setPlaybackRateVisibility(false);
    }
  }

  setPlaybackRateVisibility(visibility: boolean) {
    if (!this.availablePlaybackRate) {
      return;
    }
    if (this.videoElement.nativeElement.paused) {
      visibility = true;
    }
    this.futurePlaybackRateVisibility = visibility;
  }

  onVideoMouseMove() {
    this.lastMouseMove = new Date();
    this.setPlaybackRateVisibility(true);
  }

}
