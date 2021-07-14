# Justice40

Justice40 EJScreen prototype application.

- This is a Next.js, styled with Tailwind, using Mapbox GL for most of the magic.
- It's currently deployed to GitHub Pages, so none of the Next.js fancy stuff is usable.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

### Notes for Huncwot

This is a Next.js website, so it's a layer on top of React. This writeup assume
that you're familiar with React.

![image](https://user-images.githubusercontent.com/32314/125541860-f9b5d731-14d4-48f4-b1df-601dd0b0ed7b.png)

There are three components working here:

1. `pages/index.tsx`: the page skeleton
2. `components/map.tsx`: the map
3. `components/chart.tsx`: the chart, which reflects values on the map and can be used to filter the map

The only vital part of the code other than that is `lib/pmap.ts`, which has the logic for how the map
is set up and changed.

Here's how a few different things work:

### Changing indicators

For example, toggling between PM2.5 and Respiratory Hazard, right now.

This is done with React state in the
pages/index.tsx component, here:

- https://github.com/earthrise-media/justice-map/blob/95fd5de4a3eeb4d548f6e02a532a7f85db6eefa0/pages/index.tsx#L58

The chosen indicator is sent to the Map component here:

- https://github.com/earthrise-media/justice-map/blob/95fd5de4a3eeb4d548f6e02a532a7f85db6eefa0/pages/index.tsx#L164

And the Map component receives those values and uses a `useEffect` call to modify the displayed layer:

- https://github.com/earthrise-media/justice-map/blob/95fd5de4a3eeb4d548f6e02a532a7f85db6eefa0/components/map.tsx#L218-L238

### Showing the data from the map in a chart on the left side

The data for that chart is called `viewportData`. When the user moves the map, we wait until the map
has loaded all of the necessary data, then run [countMapFeatures](https://github.com/earthrise-media/justice-map/blob/95fd5de4a3eeb4d548f6e02a532a7f85db6eefa0/components/map.tsx#L104-L145), which
uses Mapbox GL JS's [queryRenderedFeatures](https://docs.mapbox.com/mapbox-gl-js/api/map/#map#queryrenderedfeatures)
to find the features currently visible. These features are added together and then send back to
the `pages/index.tsx` component with the [setViewPortData](https://github.com/earthrise-media/justice-map/blob/95fd5de4a3eeb4d548f6e02a532a7f85db6eefa0/components/map.tsx#L31)
method in the Map component, and then sent down to the [Chart component](https://github.com/earthrise-media/justice-map/blob/main/components/chart.tsx).

### How the chart works and how it controls the map

The chart uses [d3](https://d3js.org/) using the approach of using [React to render the DOM, and d3 to do math](https://macwright.com/2016/10/11/d3-and-react.html). The slider on the chart is powered by react-aria.

When the slider moves, the Chart component calls [setFilter](https://github.com/earthrise-media/justice-map/blob/95fd5de4a3eeb4d548f6e02a532a7f85db6eefa0/components/chart.tsx#L94), which then
is applied to the Map [in another useEffect call in the Map component](https://github.com/earthrise-media/justice-map/blob/main/components/map.tsx#L199-L216).
