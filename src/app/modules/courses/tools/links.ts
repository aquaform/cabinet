
export interface LinkElementInterface {
    element: HTMLElement;
    href: string;
    internal: boolean;
    anchor: boolean;
}

export class Links {

    public static internalMarkers: string[] = ['?', 'e1c://?', 'sdo1c?', 'sdo1c://course/?', '.?']; // Маркеры внутренних ссылок
    public static anchorMarkers: string[] = ['#', 'javascript:']; // Маркеры ссылок, которые браузер выполнит сам

    constructor() {
    }

    public static get(context: any): LinkElementInterface[] {

        const links: LinkElementInterface[] = [];
        const linkElements = context.querySelectorAll('a');

        for (const element of linkElements) {

            const href = element.getAttribute('href');

            const link: LinkElementInterface = {
                element: element,
                href: Links.href(href),
                internal: Links.isInternal(href),
                anchor: Links.isAnchor(href)
            };

            links.push(link);
        }

        return links;

    }

    public static prefix() {
        return "sdo1c:";
    }

    public static removeMarker(href: string): string {
        for (const marker of Links.internalMarkers) {
            if (href && href.substr(0, marker.length) === marker) {
                return href.substr(marker.length)
            }
        }
        return href;
    }

    public static isInternal(href: string): boolean {
        for (const marker of Links.internalMarkers) {
            if (href && href.substr(0, marker.length) === marker) {
                return true;
            }
        }
        return false;
    }

    public static isAnchor(href: string): boolean {
        for (const marker of Links.anchorMarkers) {
            if (href && href.substr(0, marker.length) === marker) {
                return true;
            }
        }
        return false;
    }

    public static href(href: string): string {

        if (Links.isInternal(href)) {
            for (const marker of Links.internalMarkers) {
                if (href.substr(0, marker.length) === marker) {
                    return href.substr(marker.length);
                }
            }
        }

        return href;

    }

}