# Walkthrough — Landing Page Demo & MVP Polish

We have implemented the public interactive demo page, added brand watermarking to generated images, and polished the landing page footer.

---

## Changes Made

### 1. Landing Page Footer
- **File**: [page.tsx](file:///c:/Users/Lawre/Desktop/projects/spotlite/app/page.tsx)
- **Refactoring**: Added a stylish footer at the bottom of the home/landing page: "Built by Ogheneyoma", linking directly to his portfolio `https://me-teal-xi.vercel.app/`.

### 2. Branding Watermark on Backend Compositor
- **File**: [service.ts](file:///c:/Users/Lawre/Desktop/projects/spotlite/lib/api/modules/image-generation/service.ts)
- **Refactoring**: Added a helper function `buildWatermarkSvg(natW, natH)` that renders a subtle, translucent white "Made with Spotlite" branding badge. This SVG is composited at the bottom-right corner of all generated graphics.

### 3. Public Interactive Demo Playground Page
- **File**: [page.tsx](file:///c:/Users/Lawre/Desktop/projects/spotlite/app/(public)/demo/page.tsx)
- **Features**:
  - A dedicated public route `/demo` that requires zero setup or database connection to minimize server cost.
  - A two-column responsive split layout:
    - **Form Panel**: Requires the user to enter their **Full Name**, **Event / Title**, and **Upload a Photo**.
    - **Live Graphic Preview**: Uses a high-resolution 1080x1080px client-side `<canvas>` element (scaled cleanly using CSS) that renders `/demo-template.png` as the background.
    - Draws the uploaded image fitted inside the template's portrait frame.
    - Composites the text inputs centered with custom fonts and colors matching the card theme.
    - Draws a matching "Made with Spotlite" watermark at the bottom-right.
    - Offers a high-quality "Download My Graphic" button that saves the card as a PNG.
    - Prompts visitors with a call to action to create a free Clerk account on Spotlite.

---

## Verification & Testing

### Automated Checks
- Verified workspace health and type safety:
  ```bash
  npx tsc --noEmit
  ```
  Status: **Passed** (0 errors) ✅

### Manual Verification
1. Open the landing page (`http://localhost:3000/`), scroll to the bottom, and click the portfolio link.
2. Click **Try the Demo** or navigate to `/demo`.
3. Try typing values into the Name and Event fields — the canvas updates live with placeholders when empty, and draws typed text when entered.
4. Try uploading a photo. Observe that it fits inside the portrait frame on the card.
5. Verify that the "Download My Graphic" button is disabled/shows errors unless Name, Event, and Photo are provided.
6. Click **Download My Graphic** and check the downloaded PNG to verify that the photo, text overlays, and "Made with Spotlite" watermark are printed in high quality.
7. Navigate to the authenticated app dashboard, upload a submission, generate a graphic, and verify that the backend compositor also prints the "Made with Spotlite" watermark on the bottom-right.

---

## Demo Page Adjustments (Update)
We have adjusted the layout and placeholders on the `/demo` playground:
- **Corrected Y-coordinates**: Shifted the text overlays vertically (Name: Y=705, Event: Y=805) to position them cleanly inside the card's rounded text boxes and prevent overlap with section labels.
- **Improved Contrast**: Changed the placeholder text colors on the preview canvas to higher-contrast shades (`#475569` and `#64748b`) so they are clearly readable against the cream/off-white background card before the visitor types.
- **Refined Placeholders**: Changed the default placeholders to represent Spotlite-themed sharing:
  - Full Name: `e.g. Yoma` (canvas: `YOUR NAME HERE`)
  - Event/Title: `e.g. Spotlite User of the Day` (canvas: `SPOTLITE USER OF THE DAY`)
- **Enforced Character Limits**: Added a `maxLength` restriction on inputs to prevent text from overflowing off the edges of the card template:
  - Name is limited to `14 characters` max.
  - Event / Title is limited to `25 characters` max.
  - Added a dynamic counter showing current characters (e.g. `12/25`) for both fields in the form.



