export function generateUID(): string {
    return '' + (new Date()).getTime() + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

// http://racialdotmap.demographics.coopercenter.org/
export function pmTooltip(val: number, label: string, zoom: number, x: number, y: number): string {
    return `<div class='popup'>
      <div class='popup__wrap'>
        <div class='popup__image'>
          <img src="https://dotmap.s3.amazonaws.com/doc/DotMap/tiles4/${zoom}/${x}/${y}.png" alt="">
        </div>
        <div class='popup__copy'>
          <div class="name">${label}</div>
          <div class="number">${Math.floor(val).toLocaleString()}</div>
        </div>
      </div>
    </div>`;
}

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
export function lon2tile(lon, zoom): number { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))); }
export function lat2tile(lat, zoom): number  { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))); }


export function kFormatter(num: number): string {
  return (Math.abs(num) > 999 ? Math.sign(num) * (+(Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)) + '';
}


export function numberWithCommas(x: number): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
