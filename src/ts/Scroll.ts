import { gsap } from 'gsap/dist/gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { breakpoint } from './Breakpoint';

gsap.registerPlugin(ScrollTrigger);

interface IItemsData {
    el: HTMLElement;
    type: string;
    shift?: number;
    time?: number;
    index?: number;
    name?: string;
    delay?: number;
}
export default class Scroll {

    public static instance: Scroll;
    private items: IItemsData[];

    constructor() {
        this.init();

        Scroll.instance = this;
    }


    public resize(): void {
    }


    private cacheElements(): void {
        this.items = [];
        this.items = [...document.querySelectorAll('[data-scroll]')].map(el => {
            const item = <HTMLElement>el;
            const cache = {
                el: item,
                type: item.dataset.scroll,
                shift: parseFloat(item.dataset.shift) || 1,
                time: parseFloat(item.dataset.time) || 1,
                index: parseFloat(item.dataset.index) || 0,
                name: item.dataset.name || '',
                delay: parseFloat(item.dataset.delay) || 0,
            };
            return cache;
        });
    }


    private init(): void {
        this.cacheElements();
        this.setActions();
    }



    private setActions(): void {
        this.items.forEach(item => {
           switch (item.type) {



                default:
                    break;
           }
        });
    }
}
