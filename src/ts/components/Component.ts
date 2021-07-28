import { Handler } from '../Handler';

export abstract class Component extends Handler {

    public uuid: string;

    constructor(protected view: HTMLElement, protected options?: string) {
        super();

        if (!view) { console.warn('component built without view'); }
    }



    public animateIn(index?: number, delay?: number): void { }




    public animateOut(): Promise<void> {

        // if you don't want to animate component,
        // just return empty Promise:
        return Promise.resolve(null);
    }




    public resize = (wdt: number, hgt: number): void => { };



    public destroy(): void {
        super.destroy();
    }
}
