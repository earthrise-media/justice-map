import { Component } from './Component';
import * as noUiSlider from 'nouislider';
import { generateUID, kFormatter } from '../Utils';
import { MapCanvas } from './MapCanvas';

declare var d3: any;
export class Chart extends Component {


    private rangeWrap: HTMLElement;
    private svgWrap: HTMLElement;
    private sliderWrap: HTMLElement;
    private slider: any;

    constructor(protected view: HTMLElement, protected options?: string) {
        super(view, options);

        this.rangeWrap = this.view.querySelector('.js-chart-range');
        this.svgWrap = this.view.querySelector('.js-chart-svg');
        this.sliderWrap = this.view.querySelector('.js-chart-slider');
        this.slider = null;
        this.uuid = generateUID();
    }


    public generateChart(data: number[], extent: number[]): void {

        const width = 290;
        const height = 40;
        const margin = { top: 0, left: 0, bottom: 0, right: 0 };

        const domain = extent;
        const xScale = d3
            .scaleLinear()
            .domain(domain)
            //   .domain([data[0], data[data.length - 1]])
            .nice()
            .range([margin.left, width - margin.right]);
        const thresholds = domain[1] < 100 ? domain[1] : 30;
        const bins = d3.bin().domain(xScale.domain()).thresholds(thresholds)(data);
        const binsY = d3.bin().thresholds(domain[1])(data);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(binsY, (d) => d.length)])
            .nice()
            .range([height - margin.bottom, margin.top]);
        this.svgWrap.innerHTML = this.drawSvg(width, height, bins, xScale, yScale);
        this.addRects(Math.max(0, xScale(bins[0].x1) - xScale(bins[0].x0) - 1), height);
        this.drawSlider(domain[0], domain[1]);

        this.rangeWrap.innerHTML = `${kFormatter(domain[0])} - ${kFormatter(domain[1])}`;
    }


    private drawSvg(width: number, height: number, bins: any, xScale: any, yScale: any): string {
        const rectWidth = Math.max(0, xScale(bins[0].x1) - xScale(bins[0].x0) - 1);
        const svg = `<svg
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}">
                ${bins.map((d, i) => {
                return (
                    `<rect
                    fill="#B91C1C"
                    x=${xScale(d.x0) + 1}
                    width=${rectWidth}
                    y=${yScale(d.length)}
                    height=${yScale(0) - yScale(d.length)}
                    />`
                );
                })}
        </svg>`;

        return svg;
    }



    private addRects(width: number, height: number): void {
        const svg = this.svgWrap.querySelector('svg');
        const rectWidth = width;
        const rectXFactor = parseFloat(svg.querySelectorAll('rect')[1].getAttribute('x')) - parseFloat(svg.querySelectorAll('rect')[0].getAttribute('x'));
        for (let width = 1; width < parseFloat(svg.getAttribute('width')); width += (rectWidth + rectXFactor + 1)) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', `${width}`);
            rect.setAttribute('y', `0`);
            rect.setAttribute('width', `${rectWidth}`);
            rect.setAttribute('height', `${height}`);
            rect.setAttribute('fill', '#D2D9DC');

            svg.prepend(rect);
        }
    }



    private drawSlider(min: number, max: number): void {
        if (!this.slider) {
            this.slider = noUiSlider.create(this.sliderWrap, {
                start: [min, max],
                connect: [true, false, true],
                step: 1,
                range: {
                    'min': min,
                    'max': max,
                },
            });

            this.slider.on(`change.${this.uuid}`, () => {
                const range = this.slider.get(true);
                MapCanvas.instance.onUpdateFilter(range[0], range[1]);
            });
        } else {
            this.slider.updateOptions({
                range: {
                    'min': min,
                    'max': max,
                },
            });

            // this.slider.set([min, max]);
        }
    }
}
