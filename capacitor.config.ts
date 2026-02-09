import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sleevo.vinylshop',
  appName: 'Sleevo - Vinyl Shop',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
    // Allow inline media playback
    allowsInlineMediaPlayback: true,
    // Limit to portrait orientation for consistent UI
    preferredContentMode: 'mobile',
    // Status bar configuration
    statusBarStyle: 'dark',
    // Scroll settings for game-like experience
    scrollEnabled: true,
    // Keyboard settings
    keyboardResize: 'native',
    // Enable native keyboard accessory bar
    keyboardResizeMode: 'native'
  },
  plugins: {
    // Status Bar plugin configuration
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1110',
      overlaysWebView: false
    },
    // Haptics plugin is ready to use (no config needed)
    Haptics: {}
  }
};

export default config;
