export interface ResImagesInterface {
    images: ResImageInterface[];
}

export interface ResImageInterface {
    collection: string; // В коллекцию входят две картинки - большая и маленькая
    filename: string;
    width: number;
    height: number;
    size: number;
}

declare let resImagesData: ResImagesInterface;


export class ResImages {

    constructor() {

        window.onload = () => {

            if (!("resImagesData" in window)
                || !window["resImagesData"]
                || !window["resImagesData"].images
                || !window["resImagesData"].images.length) {

                return;

            }

            // Вставляем нужные стили

            ResImages.initStyles();

            // Находим картинки, для которых есть большая копия

            let imageElements = [].slice.call(document.querySelectorAll("img"));

            for (let imageElement of imageElements) {

                for (let imageProp of resImagesData.images) {

                    let rightOfSrc = imageElement.src.substr(imageElement.src.length - imageProp.filename.length);
                    let leftOfSrc = imageElement.src.substr(0, imageElement.src.length - imageProp.filename.length);

                    if (rightOfSrc ===  imageProp.filename) {
                        let altImage = resImagesData.images.find(
                            (img) => img.collection === imageProp.collection && img.filename !== imageProp.filename
                        );
                        if (altImage) {

                            imageElement.style.cursor = "pointer";
                            imageElement.setAttribute("altSrc", leftOfSrc + altImage.filename);
                            imageElement.onclick = (event) => {
                                ResImages.expandImage(event.target);
                            };
                        }

                    }

                }


            }

        };

        window["closeExpandImage"] = function () {
            let expandElement = document.getElementById("expandImageElement");
            document.body.removeChild(expandElement);
            document.body.style.overflow = "auto";
        };

    }

    private static expandImage(element) {

        const altSrc: string = element.getAttribute("altSrc");

        document.body.insertAdjacentHTML("beforeend",  `

            <div class="expandImage" id="expandImageElement">
                <span class="expandImage-close" onclick="closeExpandImage()">&times;</span>
                <img class="expandImage-img" src="${altSrc}">
            </div>

        `);

        document.body.style.overflow = "hidden";

    }

    private static initStyles(): void {

        // From: https://www.w3schools.com/howto/howto_css_modal_images.asp

        let css = `

            .expandImage {
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgb(0,0,0);
                background-color: rgba(0,0,0,0.8);
                padding: 0 10px 10px 10px;
                box-sizing: border-box;
            }

            .expandImage > .expandImage-img {
                margin: auto;
                display: block;
                width: auto;
                max-width: 100%;
                height: auto;
                max-height: 100%;
                animation-name: zoom;
                animation-duration: 0.6s;
                margin-top: 75px;
            }

            @keyframes zoom {
                from {transform:scale(0)}
                to {transform:scale(1)}
            }

            .expandImage > .expandImage-close {
                position: absolute;
                top: 15px;
                right: 35px;
                color: #f1f1f1;
                font-size: 40px;
                font-weight: bold;
                transition: 0.3s;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }

            .expandImage > .expandImage-close:hover,
            .expandImage > .expandImage-close:focus {
                color: #bbb;
                text-decoration: none;
                cursor: pointer;
            }

        `;

        let head = document.head || document.getElementsByTagName('head')[0];

        let style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));

        head.appendChild(style);

    }

}
