
export class NumbersTools {

    // Склонение чисел
    //
    public static declensionNumber(num: number, titles: string[]): string {
        // titles - массив строк для цифр 1, 2 и 5
        const cases = [2, 0, 1, 1, 1, 2];
        return titles[(num % 100 > 4 && num % 100 < 20) ? 2 : cases[(num % 10 < 5) ? num % 10 : 5]];
    }

    public static average(numberArray: number[], fractionDigits?: number) {
        let total = numberArray.reduce((acc, c) => acc + c, 0);
        total = total / numberArray.length;
        if (typeof fractionDigits === "number") {
            total = Number(total.toFixed(fractionDigits));
        }
        return total;
    }

}
