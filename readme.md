Use PNPM to install dependencies. and then `pnpm run dev` to start the vite server

In index.html, there are two entry points. The first one `index.tsx` is the version of mapbox-gl that is wrapped by solid-mapbox. This is the one that exhibits the strange behabior. The second one `working.ts` uses plain mapbox-gl and works as expected. 

---

See this video to see the strange behavior. It acts like this in firefox and in chromium browsers:
[Screencast_20240424_100721.webm](https://github.com/kaeedo/SolidJsMapboxWeird/assets/3847895/3c24b9a4-21bb-4573-9ccb-d389a39b0d42)
