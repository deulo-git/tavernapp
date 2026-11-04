import { createAppleSplashScreens, defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icons and iPad launch screens from public/logo.svg: `npm run icons`.
// The splash <link> tags it prints are pasted into index.html.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: createAppleSplashScreens(
      {
        padding: 0.4,
        resizeOptions: { background: '#f7f1e8', fit: 'contain' },
        linkMediaOptions: { log: true, addMediaScreen: true, basePath: '/', xhtml: false },
        png: { compressionLevel: 9, quality: 70 },
        name: (landscape, size) =>
          `splash/ipad-${landscape ? 'landscape' : 'portrait'}-${size.width}x${size.height}.png`,
      },
      // One device per distinct iPad screen size.
      [
        'iPad Pro 12.9"',
        'iPad Pro 11"',
        'iPad Air 10.9"',
        'iPad Air 10.5"',
        'iPad 10.2"',
        'iPad 9.7"',
        'iPad mini 8.3"',
      ],
    ),
  },
  images: ['public/logo.svg'],
});
