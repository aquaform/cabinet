import { SettingsService } from '../settings/settings.service';

export class InnerHTML {

    static changeDOM(nativeElement: any, settings: SettingsService) {

        if (!nativeElement) {
            return;
        }

        const allLinks = nativeElement.querySelectorAll('a');
        if (!allLinks) {
            return;
        }
        for (const link of allLinks) {
            link.setAttribute('target', '_blank');
        }

        const allImages = nativeElement.querySelectorAll('img');

        if (!allImages) {
            return;
        }
        for (const image of allImages) {
            const src = image.getAttribute('src');
            image.setAttribute('src', settings.ImageURL(src));
        }

    }

}