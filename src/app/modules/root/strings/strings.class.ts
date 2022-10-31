export class StringsTools {

    public static SortArrayByString<A>(anyArray: A[], getElement: (element: A) => string) {
        anyArray.sort((a, b) => {
            return ('' + getElement(a)).localeCompare('' + getElement(b));
        });
    }

    public static IsJSON(jsonString: string): boolean {

        try {
            const o = JSON.parse(jsonString);
            if (o && typeof o === "object") {
                return true;
            }
        }
        catch (e) { }

        return false;

    }

    public static ReplaceAll(str: string, find: string, replace: string): string {
        // https://stackoverflow.com/a/1144788/4604351
        const escapeRegExp = (string) => {
            return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }
        return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }

}
