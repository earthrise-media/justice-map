import { gsap } from 'gsap/dist/gsap';


export class Animate {
    constructor() {
        this.defineAnimations();
    }


    private defineAnimations(): void {
        gsap.to('.js-map', {
            opacity: 1,
            duration: 2,
            delay: 2,
            ease: 'power1.out',
        });


        gsap.to('.js-menu', {
            x: '0',
            duration: 1.6,
            ease: 'power3.inOut',
            opacity: 1,
            delay: 3,
            onComplete: () => {

            },
        });

        gsap.to('.js-info', {
            x: '0',
            duration: 1.6,
            ease: 'power3.inOut',
            opacity: 1,
            delay: 3.3,
            onStart: function(): void {
                gsap.set(this.targets(), {'display': 'block'});
            },
        });


        gsap.to('.js-footer', {
            y: '0',
            duration: 1.6,
            ease: 'power3.inOut',
            opacity: 1,
            delay: 4,
        });
    }
}
