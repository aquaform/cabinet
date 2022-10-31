export class CourseSettingsProvider {

    constructor() {
    }

    public static get(name): string {

        if (!name) {
            return '';
        }

        let value;
        value = window['courseSettings'];

        let pathArray = name.split('.');
        for (let curName of pathArray) {
            if (typeof value === 'object' && curName in value) {
                value = value[curName];
            } else {
                value = '';
                break;
            }
        }
        return value;

    }

}