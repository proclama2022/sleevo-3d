// Asset paths for AI-generated images
// Place generated images in /public/assets/ folder

export const BACKGROUNDS = {
  basement: '/assets/backgrounds/basement.jpg',
  store: '/assets/backgrounds/store.jpg',
  expo: '/assets/backgrounds/expo.jpg',
};

export const TEXTURES = {
  wood: '/assets/textures/wood-crate.jpg',
  vinyl: '/assets/textures/vinyl-grooves.jpg',
};

export const VINYL_SLEEVES = {
  Rock: '/assets/sleeves/rock.jpg',
  Jazz: '/assets/sleeves/jazz.jpg',
  Soul: '/assets/sleeves/soul.jpg',
  Funk: '/assets/sleeves/funk.jpg',
  Disco: '/assets/sleeves/disco.jpg',
  Punk: '/assets/sleeves/punk.jpg',
  Electronic: '/assets/sleeves/electronic.jpg',
};

export const PROPS = {
  lightBulb: '/assets/props/light-bulb.png',
  neonSign: '/assets/props/neon-records.png',
  vinylRecord: '/assets/props/vinyl-record.png',
};

export const POSTERS = {
  rock: '/assets/posters/rock-poster.jpg',
  jazz: '/assets/posters/jazz-poster.jpg',
  soul: '/assets/posters/soul-poster.jpg',
};

export const LOGO = '/assets/logo.png';

/** Fill The Fridge style: AI-generated shelf and crate assets (Runware CDN) */
export const FILL_THE_FRIDGE = {
  /** Main shelf cabinet - front view, blue frame, orange dividers, white compartments */
  shelf:
    'https://im.runware.ai/image/ws/4/ii/65dc4816-1f07-4e88-bb49-a044d6d90a77.png',
  /** Bottom open crates - purple containers for incoming vinyls */
  crate:
    'https://im.runware.ai/image/ws/3/ii/0caeb50b-cf0e-4a6a-a769-1ad23d0845ad.png',
};

// Fallback to current CSS-based design if images not loaded
export const useImageWithFallback = (src: string, fallback: () => JSX.Element) => {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(false);
  }, [src]);

  return { loaded };
};
