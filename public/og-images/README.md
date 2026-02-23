# Open Graph (OG) Images

Social media preview images for sharing Dexter platform links.

## Images

### 1. Default Dexter OG Image
**File:** `/og-image.png` (117KB)
**Dimensions:** 1200x630px
**Used for:** All Dexter pages without specific OG images
**Branding:** Indigo/Blue gradient, Dexter logo, AI-powered influencer marketing theme
**Features shown:**
- AI-Powered Matching
- Transparent Analytics
- Content Generation
- Seamless Payments
- Stats: 500+ Brands, 10K+ Influencers, $2M+ Paid to Creators

---

### 2. Tumanasi Landing Page
**File:** `/og-images/tumanasi-landing.png` (168KB)
**Dimensions:** 1200x630px
**Page:** `/tumanasi`
**Branding:** Navy/Blue to Orange gradient, delivery theme
**Features shown:**
- TUMANASI branding
- Tagline: "Your Partner in Sending Easy"
- Same-day delivery, 200+ areas
- Verified riders, Photo proof
- Pay on delivery, From KES 100

---

### 3. Tumanasi Pricing Page
**File:** `/og-images/tumanasi-pricing.png` (190KB)
**Dimensions:** 1200x630px
**Page:** `/tumanasi/pricing`
**Branding:** Navy/Blue to Orange gradient, pricing cards theme
**Features shown:**
- TUMANASI PRICING title
- Sample prices: CBD (KES 150), Ngong Road (KES 300), Thika Road (KES 350)
- 200+ Areas Covered
- No hidden fees, Pay on delivery, Live tracking

---

## Color Schemes

### Dexter (Default)
- Primary: `#4F46E5` → `#6366F1` → `#3B82F6` (Indigo to Blue)
- Accent: `#93C5FD` (Light Blue)
- Background: Gradient with blur effects

### Tumanasi
- Primary: `#1e3a5f` → `#0f62a8` (Navy to Blue)
- Accent: `#f97316` (Orange)
- Background: Gradient with decorative elements

---

## Usage

Images are automatically used by the SEO component when pages are shared on:
- Facebook
- Twitter/X
- LinkedIn
- WhatsApp
- Telegram
- iMessage
- Slack
- Discord

### Adding OG Images to New Pages

```jsx
import SEO from '../../components/SEO';

function YourPage() {
  return (
    <>
      <SEO
        title="Your Page Title"
        description="Your page description"
        image="/og-images/your-image.png"
        imageAlt="Alternative text for your image"
        type="website"
      />
      {/* Your page content */}
    </>
  );
}
```

---

## Regenerating Images

If you need to update the graphics:

1. Edit the SVG source files in this directory
2. Run the conversion script:
   ```bash
   node scripts/convert-og-images.cjs
   ```

The script will automatically convert all SVG files to PNG at 1200x630px.

---

## Testing Social Media Previews

Test your links using these validators:

1. **Facebook:** https://developers.facebook.com/tools/debug/
2. **Twitter:** https://cards-dev.twitter.com/validator
3. **LinkedIn:** https://www.linkedin.com/post-inspector/
4. **WhatsApp:** Share link in a chat (no validator available)

---

## Technical Details

- **Format:** PNG (recommended for social media)
- **Dimensions:** 1200 x 630 pixels (standard OG image size)
- **Created with:** SVG → PNG conversion using Sharp
- **Conversion script:** `scripts/convert-og-images.cjs`

---

## Notes

- SVG source files are kept for easy editing
- PNG files are used in production for better compatibility
- Images use filters and gradients for modern, professional look
- All text is embedded for consistent rendering across platforms
