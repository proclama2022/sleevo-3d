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
