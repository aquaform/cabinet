import {Links} from "../tools/links";

export class ResLinks {

    public static process() {

        let allLinks = Links.get(window.document);

        for (let link of allLinks) {
            if (link.internal) {
                link.element.addEventListener("click",
                    (event) => {
                        event.preventDefault();
                        ResLinks.goToLink(link.href);
                    },
                    false
                );
            } else if (link.anchor) {
                // Оставляем как есть
            } else {
                link.element.setAttribute('target', '_blank');
            }
        }

        window["oAPI_1C_V8_SUZ"] = {
            goToLink: (href: string) => {
                if (Links.isInternal(href)) {
                    ResLinks.goToLink(href);
                } else {
                    alert("Wrong href: " + href);
                }

            }
        };

    }

    private static goToLink(href: string) {
        window.parent.postMessage(Links.prefix() + Links.href(href), "*");
    }

}