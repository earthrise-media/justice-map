export abstract class Handler {


    public events: Object;

    constructor () {
        this.events = {};
    }


    /**
     * Attach an event handler function.
     * @param  {string}   eventName please use static names
     * @param  {Function} handler   callback function
     * @return {Handler}            returns current object
     */
    public on(eventName: string, handler: Function): Handler {

        if ( !this.events[eventName] ) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(handler);
        return this;
    }



    /**
     * Detach an event handler function.
     * @param  {string}   eventName please use static names
     * @param  {Function} handler   callback function
     * @return {Handler}            returns current object
     */
    public off(eventName?: string, handler?: Function): Handler {

        if (typeof eventName === 'undefined') {
            this.events = {};
            return this;
        }

        if (typeof handler === 'undefined' && this.events[eventName]) {
            this.events[eventName] = [];
            return this;
        }

        if ( !this.events[eventName] ) {
            return this;
        }

        const index = this.events[eventName].indexOf(handler);

        if ( index > -1 ) {
            this.events[eventName].splice(index, 1);
        }

        return this;
    }



    /**
     * Call an event handler function.
     * @param {string} eventName
     * @param {[type]} ...extraParameters pass any parameters to callback function
     */
    public trigger(eventName: string, ...extraParameters): void {

        if ( !this.events[eventName] ) { return; }
        const args = arguments;
        this.events[eventName].forEach(event => event.apply(this, [].slice.call(args, 1)));
    }



    public destroy(): void {
        this.events = {};
    }
}

