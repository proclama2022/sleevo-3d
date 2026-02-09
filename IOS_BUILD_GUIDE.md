# iOS Build Guide - Sleevo Vinyl Shop Manager

## Configuration Complete ✅

The Capacitor iOS platform has been successfully configured for the Sleevo Vinyl Shop Manager app.

### What's Been Done

1. **Installed Required Packages**
   - `@capacitor/cli` v8.0.2
   - `@capacitor/ios` v8.0.2
   - Already had: `@capacitor/core`, `@capacitor/haptics`, `@capacitor/status-bar`

2. **Created Configuration Files**
   - `capacitor.config.ts` with iOS-specific settings
   - App ID: `com.sleevo.vinylshop`
   - App Name: `Sleevo - Vinyl Shop`
   - Web directory: `dist`

3. **Initialized iOS Platform**
   - Native Xcode project created in `/ios` folder
   - Configured with StatusBar and Haptics plugins
   - Web assets synced to iOS project

4. **Added Build Scripts to package.json**
   - `npm run cap:sync` - Sync all platforms
   - `npm run cap:sync:ios` - Sync iOS only
   - `npm run cap:open:ios` - Open Xcode project
   - `npm run ios:build` - Build web + sync + open Xcode

### iOS Configuration Details

**Bundle Identifier:** `com.sleevo.vinylshop`

**App Name:** Sleevo - Vinyl Shop

**Supported Orientations:**
- iPhone: Portrait, Landscape Left, Landscape Right
- iPad: All orientations

**Status Bar:**
- Style: Dark
- Background: #1a1110 (matches app theme)
- Non-overlaying

**Plugins Configured:**
- StatusBar (v8.0.0) - For status bar styling
- Haptics (v8.0.0) - For tactile feedback

### Next Steps (Requires Xcode)

⚠️ **The following steps require Xcode to be installed**

#### 1. Install Xcode
- Download from Mac App Store
- Open Xcode and accept license agreements
- Install Command Line Tools: `xcode-select --install`

#### 2. Open the iOS Project
```bash
npm run cap:open:ios
```
This will open the project in Xcode.

#### 3. Configure Signing & Capabilities
In Xcode:
1. Select the "App" target
2. Go to "Signing & Capabilities" tab
3. Select your development team
4. Ensure Bundle Identifier is: `com.sleevo.vinylshop`
5. Add capabilities if needed:
   - In-App Purchase (if implementing purchases)
   - Game Center (if implementing leaderboards)

#### 4. Update App Icons and Launch Screen
- Add app icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Customize Launch Screen storyboard if desired

#### 5. Configure Version and Build Numbers
In Xcode project settings:
- Marketing Version: 1.0.0 (or your version)
- Current Project Version: 1 (build number)

#### 6. Test on Simulator
1. Select a simulator from the device menu (e.g., iPhone 15)
2. Click the "Play" button or press Cmd+R
3. App should launch in the simulator

#### 7. Test on Physical Device
1. Connect iPhone/iPad via USB
2. Trust the computer on the device
3. Select your device from the device menu
4. Click "Play" to build and run

#### 8. App Store Preparation
Before submitting to App Store:
- [ ] Replace placeholder app icons with final designs
- [ ] Add privacy policy URL if collecting data
- [ ] Configure App Store Connect
- [ ] Create app screenshots (various device sizes)
- [ ] Write app description and metadata
- [ ] Set up In-App Purchases if applicable
- [ ] Test thoroughly on multiple devices
- [ ] Archive build (Product → Archive in Xcode)
- [ ] Upload to App Store Connect

### Development Workflow

**When you make changes to web code:**
```bash
npm run build          # Build the web app
npm run cap:sync:ios   # Sync changes to iOS
npm run cap:open:ios   # Open Xcode to run
```

**Or use the combined command:**
```bash
npm run ios:build
```

### Troubleshooting

**Build fails in Xcode:**
- Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
- Delete DerivedData folder
- Ensure you're using compatible iOS deployment target

**Web changes not appearing:**
- Make sure you ran `npm run build` after code changes
- Run `npm run cap:sync:ios` to copy new dist files
- In Xcode, clean and rebuild

**Signing errors:**
- Check that your Apple Developer account is active
- Ensure Bundle ID matches your App ID in Apple Developer Portal
- Verify provisioning profiles are valid

### File Structure

```
/ios/
├── App/
│   ├── App/                    # Main app target
│   │   ├── Info.plist          # App configuration
│   │   ├── capacitor.config.json
│   │   └── public/             # Web assets (synced from dist/)
│   ├── App.xcodeproj/          # Xcode project
│   └── Podfile                 # CocoaPods dependencies (if any)
└── debug.xcconfig              # Debug configuration
```

### App Store Requirements Checklist

- [ ] App icons (1024x1024 for App Store, various sizes for device)
- [ ] Launch screen/splash screen
- [ ] Privacy Policy URL
- [ ] App description and keywords
- [ ] Screenshots for all required device sizes
- [ ] Age rating information
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Valid Apple Developer Program membership ($99/year)

### Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Portal](https://developer.apple.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)

---

**Configuration completed by:** Capacitor Specialist
**Date:** February 7, 2026
**Capacitor Version:** 8.0.2
