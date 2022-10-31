export class WINDOW {

    public static tabletLandscapeUp(): boolean {
        return (window.innerWidth >= 900);
    }

    public static miniPhoneVerticalDown(): boolean {
        return (window.innerWidth <= 340);
    }

}