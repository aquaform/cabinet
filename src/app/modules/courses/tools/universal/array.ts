export class ARRAY {

    /**
     * Shuffles array in place. ES6 version
     * @param {Array} a items The array containing the items.
     */
    public static shuffle(a: any[]): void {
        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }
    }

    // Получает массив вида 1,2,3....
    //
    public static index(length: number): number[] {

        let indexQuestions = [];
        for (let i = 0; i < length; i++) {
            indexQuestions.push(i);
        }
        return indexQuestions;

    }

}