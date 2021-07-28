export interface IBreakpoint {
    desktop: boolean;
    tablet: boolean;
    phone: boolean;
    value: string;
}

export let breakpoint: IBreakpoint;

export class Breakpoint {

    public static update(): void {

        const cssBefore = window.getComputedStyle(document.querySelector('body'), ':before');
        const cssBeforeValue = cssBefore.getPropertyValue('content').replace(/[\"\']/g, '');

        breakpoint = {
            desktop: cssBeforeValue === 'desktop',
            phone: cssBeforeValue === 'phone',
            tablet: cssBeforeValue === 'tablet',
            value: cssBeforeValue,
        };
    }
}
