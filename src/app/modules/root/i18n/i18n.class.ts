import { TranslateService } from "@ngx-translate/core";
import { environment } from '@environments/environment';
import * as dayjs from 'dayjs';
import * as ru from 'dayjs/locale/ru';
import * as LocalizedFormat from 'dayjs/plugin/localizedFormat';

export type Lang = "ru" | "en";

export type LangDescription = {
    name: Lang;
    label: string;
};

export class Language {

    private static description: LangDescription[] = [
        {name: "ru", label: "Русский"},
        {name: "en", label: "English"},
    ];

    public static init(translate: TranslateService) {
        translate.addLangs(this.supportedLangs());
        // translate.setDefaultLang('en'); - не используется, так как не должно быть непереведенных символов,
        // а при установке языка по умолчанию грузится файл с переводом этого языка, что не хорошо.
        let lang = environment.defaultLang;
        if (!lang) {
            const browserLang = translate.getBrowserLang() as Lang;
            lang = this.supportedLangs().indexOf(browserLang) > -1 ? browserLang : 'en';
        }
        // Устанавливаем перевод интерфейса
        translate.use(lang);
        // Устанавливаем локализацию дат
        if (lang === 'ru') {
            dayjs.locale('ru', ru);
        } else {
            dayjs.locale('en');
        }
        dayjs.extend(LocalizedFormat);
    }

    public static get(translate: TranslateService): Lang {
        return translate.currentLang as Lang;
    }

    public static supportedLangs(): Lang[] {
        return ['en', 'ru'];
    }

    public static descriptionLangs(): LangDescription[] {
        return this.description;
    }

}
