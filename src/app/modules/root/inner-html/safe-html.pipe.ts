import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({ name: 'safeHtml' })
export class SafeHTMLPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }
    transform(style: any) {
        return this.sanitizer.bypassSecurityTrustHtml(style);
        // https://angular.io/api/platform-browser/DomSanitizer
        // https://stackoverflow.com/a/41089093/4604351
    }
}
