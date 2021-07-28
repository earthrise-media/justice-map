export default class Images {


    public static bind(selector?: string): void {

        let target = typeof selector === 'undefined' ? 'body' : selector;


        document.querySelector(target).querySelectorAll('[data-src]').forEach((img): void => {
            img.setAttribute('src', img.getAttribute('data-src'));
            img.removeAttribute('data-src');
        });

        document.querySelector(target).querySelectorAll('[data-srcset]').forEach((img): void => {
            img.setAttribute('srcset', img.getAttribute('data-srcset'));
            img.removeAttribute('data-srcset');
        });


        document.querySelector(target).querySelectorAll('img.is-loading').forEach((img: HTMLImageElement) => {
            img.onload = Images.onLoad;
            img.onerror = Images.onError;
            if (img.complete && img.height > 0) {
                img.classList.remove('is-loading');
            }
        });

        if (document.querySelector(target).querySelectorAll('[data-imagefill]').length > 0) {
            // tslint:disable-next-line: no-console
            console.info('Instead of `[data-imagefill]` please use css `object-fit`…');
        }
    }


    private static onError = (e) => {
        console.warn(e);
    }


    private static onLoad = (e): void => {
        e.target.classList.remove('is-loading');
    }

}
