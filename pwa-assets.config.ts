import { createAppleSplashScreens, defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the PWA icons and iPad launch screens from public/logo.png: `npm run icons`.
// The splash <link> tags it prints are pasted into index.html.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    // iOS fills transparent icon areas with black, so home-screen icons get a white background.
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#ffffff' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#ffffff' } },
    appleSplashScreens: createAppleSplashScreens(
      {
        padding: 0.4,
        resizeOptions: { background: '#ffffff', fit: 'contain' },
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
  images: ['public/logo.png'],
});
