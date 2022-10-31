export class EmptyClass {
}

export interface AnyObject {
    [prop: string]: any;
}

export interface AnyClass extends AnyObject {
    new(...args: any[]): {};
}

export type AnyFunction = (val: any) => any;
