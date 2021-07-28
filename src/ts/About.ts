import { gsap } from 'gsap/dist/gsap';


export class About {
    public static instance: About;
    private wrap: HTMLElement;
    private button: HTMLElement;
    private isAnimating = false;
    private isShown = false;

    constructor() {

        this.wrap = document.querySelector('.js-about');
        this.button = document.querySelector('.js-toggle-about');

        this.button.addEventListener('click', this.onClick);

        // mousedown beacause mapbox stops click propagation
        document.addEventListener('mousedown', this.onClickAnywhere);

        About.instance = this;
    }


    public show(): void {
        this.isAnimating = true;
        this.wrap.style.display = 'block';

        gsap.to(this.wrap, {
            opacity: 1,
            onComplete: () => {
                this.isShown = true;
                this.isAnimating = false;
            },
        });
    }



    public hide(): void {
        if (!this.isShown) { return; }
        this.isAnimating = true;

        gsap.to(this.wrap, {
            opacity: 0,
            onComplete: () => {
                this.wrap.style.display = 'none';
                this.isShown = false;
                this.isAnimating = false;
            },
        });
    }



    private onClick = (): void => {
        if (this.isAnimating) { return; }

        this.isShown ? this.hide() : this.show();
    }



    private onClickAnywhere = (event: MouseEvent): void => {
        const isClickInside = this.wrap.contains(<Node>event.target) || this.button.contains(<Node>event.target);

        if (!isClickInside) {
            this.hide();
        }
    }
}
