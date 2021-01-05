## Icicle Bubbles

[Live demo](https://react-icicle-bubbles.kosuke.vercel.app/)

This is a Icicle-Bubble experiment with react, Inspiring by @edankwan

**Icicle Bubbles** is a WebGL experience by Edan Kwan. Unlike traditional 3D metaball effect, it only blends the depth. Which means there is no transparency support but in that case there is no need to deal with the blocked mesh. For the light scattering effect, it is faked by the depth blend and the depth blur with upside/downside rendering.

For more information about the cheap metaball technique, please check out my **[blog post](http://blog.edankwan.com/post/fake-and-cheap-3d-metaball)**.

## Getting Started

First, run the development server:

```bash
yarn install

yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License
This experiment is under MIT License.
