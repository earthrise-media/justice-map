import { Browser } from './Browser';
import { Breakpoint } from './Breakpoint';
import { components } from './Classes';
import { Component } from './components/Component';
import { Animate } from './Animate';
import { About } from './About';



interface IComp {
    component: Component;
}

class App {

    private components: Array<IComp>;

    constructor() {
        this.init();
    }


    private init (): void {
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        Breakpoint.update();
        Browser.update();
        // tslint:disable-next-line: no-unused-expression
        new Animate();
        // tslint:disable-next-line: no-unused-expression
        new About();

        this.initComponents();

        window.addEventListener('resize', this.onResize);
    }


    private onResize = (): void => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);

        this.components.forEach(item => {
            item.component.resize(width, height);
        });
    }


    private initComponents(): void {
        this.components = [];

        this.components = [...document.querySelectorAll('[data-component]')].map( el => {
            const element = <HTMLElement>el;
            const name = element.dataset.component;
            if (name !== undefined && components[name]) {
                let options: Object;
                if (!!element.dataset.options) {
                    options = JSON.parse(element.dataset.options);
                }
                const component = new components[name](element, options);
                let obj = <IComp>{};
                obj['component'] = component;
                return obj;
            } else {
                window.console.warn('There is no `%s` component!', name);
            }
        });
    }
}

const app = new App();
