
export class BROWSER {

    public static isOldIE: boolean = undefined;
    public static isOldWebkit: boolean = undefined;

    constructor() {
    }

    public static oldIE(): boolean {
        if (BROWSER.isOldIE === undefined) {
            let version = BROWSER.versionIE();
            BROWSER.isOldIE = !(!version || version >= 12);
        }
        return BROWSER.isOldIE;
    }

    // Webkit Safari до 10 версии включительно.
    // В платформе 8.3.11- Linux используется версия 6
    // В платформе 8.3.12+ Linux используется версия 8
    //
    public static oldWebkit(): boolean {
        if (BROWSER.isOldWebkit === undefined) {
            let versionWebkit = BROWSER.versionSafari();
            BROWSER.isOldWebkit = (versionWebkit > 0 && versionWebkit < 10);
        }
        return BROWSER.isOldWebkit;
    }

    public static versionSafari(): number {

        let browser = BROWSER.versionBrowser();

        if (!browser || browser.length !== 2 || !browser[0] || !browser[1]) {
            return 0;
        }

        let versionString = browser[1].toLowerCase();

        if (/mobile/i.test(versionString)) {
            return 0;
        }

        let versionArray = versionString.split(".");
        let version;

        if (versionArray && versionArray.length) {
            try {
                version = Number(versionArray[0]);
            } catch (err) {
                console.error(err);
                return 0;
            }
            if (!version) {
                return 0;
            }
        } else {
            return 0;
        }

        if (browser[0] === "Chrome" && version < 28) {
            return 6;
        }

        if (browser[0] === "Safari") {
            return version;
        }

        return 0;

    }

    /**
     * detect IE
     * returns version of IE or false, if browser is not Internet Explorer
     */
    private static versionIE(): number {

        let ua = window.navigator.userAgent;

        // Test values; Uncomment to check result …

        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

        // IE 12 / Spartan
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

        // Edge (IE 12+)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

        let msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        let trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            let rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        let edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return 0;
    }

    private static versionBrowser(): string[] {

        let browser: string = '';
        let version: string = '';
        let ua: string = navigator.userAgent;
        let tem: string[] = [];
        let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i);

        if (M !== null && M && M.length > 1) {

            // IE will be identified as 'Trident' and a different version number.
            // The name must be corrected to 'Internet Explorer' and the correct version identified.
            // ie correction
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+.?\d*)/g.exec(ua) || [];
                browser = 'Internet Explorer';
                if (!!tem && tem.length) {
                    version = tem[1];
                }
            }

            // firefox
            else if (/firefox/i.test(M[1])) {
                tem = /\brv[ :]+(\d+.?\d*)/g.exec(ua) || [];
                browser = 'Firefox';
                if (!!tem && tem.length) {
                    version = tem[1];
                }
            }

            // safari
            else if (/safari/i.test(M[1])) {
                tem = ua.match(/\bVersion\/(\d+.?\d*\s*\w+)/);
                browser = 'Safari';
                if (!!tem && tem.length) {
                    version = tem[1];
                }
            }

            // If 'Chrome' is found, it may be another browser.
            else if (M[1] === 'Chrome') {
                // opera
                let temOpr = ua.match(/\b(OPR)\/(\d+.?\d*.?\d*.?\d*)/);
                // edge
                let temEdge = ua.match(/\b(Edge)\/(\d+.?\d*)/);
                // chrome
                let temChrome = ua.match(/\b(Chrome)\/(\d+.?\d*.?\d*.?\d*)/);

                // a genuine 'Chrome' reading will result from ONLY temChrome not being null.
                let genuineChrome = temOpr == null && temEdge == null && temChrome != null;

                if (temOpr != null && temOpr.length > 2) {
                    browser = temOpr[1].replace('OPR', 'Opera');
                    version = temOpr[2];
                }

                if (temEdge != null && temEdge.length > 2) {
                    browser = temEdge[1];
                    version = temEdge[2];
                }

                if (temChrome !== null && temChrome.length > 2 && genuineChrome) {
                    browser = temChrome[1];
                    version = temChrome[2];
                }
            }

        }

        return [browser, version];

        // There will be some odd balls, so if you wish to support those browsers,
        // add functionality to display those browsers as well.


    }


}