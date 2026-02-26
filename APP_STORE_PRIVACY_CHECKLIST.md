# App Store Privacy Checklist for Sleevo

## Privacy Policy Completion Status
✅ Privacy Policy created (PRIVACY_POLICY.md)
✅ HTML version created for web hosting (privacy-policy.html)

## Before App Store Submission

### 1. Update Privacy Policy Contact Information
Replace these placeholders in both files:
- [ ] `[Your Contact Email]` → Your actual support email
- [ ] `[Your Name/Company Name]` → Your legal name or company
- [ ] `[Your Website URL]` → Your website (or remove if not applicable)

### 2. Host Privacy Policy Online
Apple requires a publicly accessible URL:
- [ ] Upload `privacy-policy.html` to web hosting
- [ ] OR use GitHub Pages (free option)
- [ ] Verify the URL is publicly accessible
- [ ] Note the final URL: ___________________________

**GitHub Pages Quick Setup:**
```bash
# If using GitHub
1. Create a new repository (e.g., sleevo-privacy)
2. Upload privacy-policy.html
3. Enable GitHub Pages in repository settings
4. Your URL will be: https://[username].github.io/sleevo-privacy/privacy-policy.html
```

### 3. App Store Connect Privacy Questionnaire

When filling out the App Store Connect privacy section, answer as follows:

#### Data Collection
**Question:** Does your app collect data?
**Answer:** NO

**Question:** Does your app use data for tracking?
**Answer:** NO

**Question:** Does your app link data to users?
**Answer:** NO

#### App Privacy Details
Mark ALL as "NO":
- [ ] Contact Info - NO
- [ ] Health & Fitness - NO
- [ ] Financial Info - NO
- [ ] Location - NO
- [ ] Sensitive Info - NO
- [ ] Contacts - NO
- [ ] User Content - NO
- [ ] Browsing History - NO
- [ ] Search History - NO
- [ ] Identifiers - NO
- [ ] Purchases - NO
- [ ] Usage Data - NO
- [ ] Diagnostics - NO
- [ ] Other Data - NO

### 4. App Permissions Declaration

**Permissions Used:**
1. **Haptic Feedback**
   - Purpose: Enhance gameplay experience with tactile feedback
   - Required: NO (Optional)
   - Usage: Triggered on game events (sorting records, errors, success)

2. **Status Bar Control**
   - Purpose: Optimize visual appearance of game interface
   - Required: NO (Optional)
   - Usage: Adjusts status bar style for immersive experience

**No Other Permissions Required**

### 5. Privacy Policy URL in App Store Connect

In App Store Connect:
1. Go to "App Information"
2. Scroll to "Privacy Policy URL"
3. Enter your hosted privacy policy URL: ___________________________
4. Save changes

### 6. Optional: Add Privacy Link in App

**Recommended Implementation:**
Add a "Privacy Policy" button in the game's menu screen that opens the hosted URL in the device browser.

**Code suggestion for App.tsx:**
```typescript
// In the menu screen, add:
<button
  onClick={() => window.open('YOUR_PRIVACY_URL', '_blank')}
  className="text-gray-400 underline text-sm mt-4"
>
  Privacy Policy
</button>
```

### 7. Age Rating

**Recommended Age Rating:** 4+
- No objectionable content
- No violence, profanity, or mature themes
- Suitable for all ages
- No in-app purchases
- No social features
- No user-generated content

### 8. Final Checks Before Submission

- [ ] Privacy Policy URL is publicly accessible
- [ ] Privacy Policy URL works on mobile devices
- [ ] All placeholder text has been replaced
- [ ] Contact information is accurate
- [ ] Privacy questionnaire completed correctly (all "NO")
- [ ] Age rating is appropriate
- [ ] App description doesn't contradict privacy claims

## Data Collection Summary (For Reference)

**What We Collect:** Nothing
**What We Store Locally:** Game progress, scores, settings
**What We Send to Servers:** Nothing
**Third-Party Services:** Lucide Icons CDN (for loading icons only)
**Analytics:** None
**Advertising:** None
**Tracking:** None

## Common App Store Rejection Reasons (Privacy-Related)

❌ **Avoid:**
1. Privacy Policy URL not accessible
2. Privacy Policy contradicts app behavior
3. Collecting data without disclosure
4. Using analytics without declaring it
5. Generic/template privacy policies with placeholder text

✅ **Our Status:**
All of the above are properly addressed in our privacy policy.

## Support Resources

- Apple Privacy Guidelines: https://developer.apple.com/app-store/review/guidelines/#privacy
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Privacy Policy Generator: Not needed - custom policy created

## Notes

- Sleevo is a privacy-friendly app with no data collection
- The privacy policy is comprehensive and compliant
- No special privacy configurations needed in Xcode
- No SDK integrations that require privacy disclosures
- Local storage only - transparent and user-controlled

---

**Last Updated:** February 7, 2026
**Prepared by:** Legal/Compliance Specialist
