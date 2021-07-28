import { gsap } from 'gsap/dist/gsap';
import { Component } from './Component';
import { MapCanvas } from './MapCanvas';
import { Tooltip } from './Tooltip';

export class Form extends Component {

    public static instance: Form;
    public currentIndex: number;
    private inputs: NodeListOf<HTMLInputElement>;
    private tooltip: Tooltip;
    private isSelected = false;
    private isTooltipShown = false;
    private isAnimating = false;
    private loader: HTMLElement;
    private line: HTMLElement;


    constructor(protected view: HTMLElement, protected options?: string) {
        super(view, options);

        this.inputs = this.view.querySelectorAll('input');
        this.loader = document.querySelector('.js-loader');
        this.line = this.view.querySelector('.js-line');

        this.init();

        Form.instance = this;
    }


    private init(): void {

        this.currentIndex = 0;
        this.tooltip = new Tooltip(document.querySelector('.js-tooltip'));
        this.tooltip.updateItem(this.currentIndex);
        this.bind();
    }


    private bind(): void {
        this.inputs.forEach(input => {
            input.addEventListener('change', this.onChange);
        });
    }



    private onChange = (e): void => {
        const el = e.target;
        const index = [...this.inputs].indexOf(el);
        const checkedItems = [...this.inputs].filter(input => input.checked);

        if (checkedItems.length >= 1) {
            this.toggleTooltip(false);
            this.toggleLine(true);
            if (checkedItems.length >= 2) {
                this.inputs.forEach(input => input.checked = false);
                this.inputs[index].checked = true;
            }

            this.currentIndex = index;
            this.tooltip.updateItem(this.currentIndex);
            this.moveLine(this.currentIndex);
            const canvas = MapCanvas.instance.mapComp.map.getCanvas();
            this.isAnimating = true;
            this.loader.classList.add('is-loading');
            gsap.to(canvas, {
                filter: `blur(${6}px)`,
                duration: .2,
                ease: 'power3.out',
                onComplete: () => {
                    MapCanvas.instance.onUpdateVisibleLayer(el.value);
                    gsap.to(canvas, {
                        filter: `blur(${0}px)`,
                        duration: .8,
                        ease: 'power3.in',
                        onComplete: () => {
                            this.loader.classList.remove('is-loading');
                        },
                    });
                },
            });
        } else {
            this.toggleLine(false);
            this.toggleTooltip(true);
            MapCanvas.instance.hideLayers();
        }



        // if (this.currentIndex === null || index !== this.currentIndex) {

        //     this.currentIndex = index;
        //     this.tooltip.updateItem(this.currentIndex);
        //     const canvas = MapCanvas.instance.mapComp.map.getCanvas();
        //     this.isAnimating = true;
        //     gsap.to(canvas, {
        //         filter: `blur(${6}px)`,
        //         duration: .2,
        //         ease: 'power3.out',
        //         onComplete: () => {
        //             MapCanvas.instance.onUpdateVisibleLayer(el.value);
        //             gsap.to(canvas, {
        //                 filter: `blur(${0}px)`,
        //                 duration: .8,
        //                 ease: 'power3.in',
        //                 onComplete: () => { this.isAnimating = false; },
        //             });
        //         },
        //     });

        //     if (!this.isSelected) {
        //         this.toggleTooltip(false);
        //         this.isSelected = true;
        //     }
        // } else {
        //     this.inputs.forEach(input => input.checked = false);
        //     MapCanvas.instance.hideLayers();
        //     this.currentIndex = null;
        //     this.toggleTooltip(true);
        //     this.isSelected = false;
        // }
    }



    private toggleTooltip(hide: boolean): void {

        this.tooltip.toggleView(hide);

        gsap.to('.js-info', {
            opacity: hide ? 1 : 0,
        });
    }



    private moveLine(index: number): void {
        gsap.to(this.line, {
            x: this.inputs[0].parentElement.clientWidth * index,
            duration: .4,
            ease: 'power2.out',
        });
    }



    private toggleLine(show: boolean): void {
        gsap.to(this.line, {
            scaleX: show ? 1 : 0,
            duration: .4,
            ease: 'power2.out',
        });
    }
}
