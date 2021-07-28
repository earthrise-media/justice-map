import { gsap } from 'gsap/dist/gsap';
import { Component } from './Component';
import { numberWithCommas } from '../Utils';
export class Tooltip extends Component {


    public static instance: Tooltip;
    private items: NodeListOf<HTMLInputElement>;
    private chartGroup: NodeListOf<HTMLInputElement>;
    private impactGroup: NodeListOf<HTMLInputElement>;
    private zoomGroup: NodeListOf<HTMLInputElement>;
    private currentIndex: number;

    constructor(protected view: HTMLElement, protected options?: string) {
        super(view, options);

        this.items = this.view.querySelectorAll('.js-tooltip-item');
        this.chartGroup = this.view.querySelectorAll('.js-chart-group');
        this.impactGroup = this.view.querySelectorAll('.js-impact-group');
        this.zoomGroup = this.view.querySelectorAll('.js-tooltip-helper');
        this.currentIndex = 0;

        this.init();
        Tooltip.instance = this;
    }


    public updateItem(index: number): void {
        gsap.to(this.items, {
            opacity: 0,
            pointerEvents: 'none',
        });

        gsap.to(this.items[index], {
            opacity: 1,
            pointerEvents: 'all',
        });

        this.currentIndex = index;
    }


    public toggleExtraData(isShown: boolean): void {
        gsap.to([this.impactGroup, this.chartGroup, this.zoomGroup], {
            opacity: 0,
            pointerEvents: 'none',
        });

        if (isShown) {
            gsap.to([this.impactGroup[this.currentIndex], this.chartGroup[this.currentIndex]], {
                opacity: 1,
                pointerEvents: 'all',
            });
        } else {
            gsap.to(this.zoomGroup, {
                opacity: 1,
            });

        }
    }



    public updateInfo(blocking: number, population: number): void {
        const elBlocking = this.impactGroup[this.currentIndex].querySelector('.js-blocking');
        const elPopulation = this.impactGroup[this.currentIndex].querySelector('.js-population');

        elBlocking.innerHTML = numberWithCommas(blocking);
        elPopulation.innerHTML = numberWithCommas(population);
    }



    public toggleView(hide: boolean): void {
        gsap.to(this.view, {
            opacity: hide ? 0 : 1,
        });
    }


    private init(): void {

        this.bind();
    }


    private bind(): void {

    }



}
