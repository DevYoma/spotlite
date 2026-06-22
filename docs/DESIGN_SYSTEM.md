# DESIGN_SYSTEM.md

# Spotlite Design System

## Design Philosophy

Spotlite should feel:

* Creative
* Modern
* Fast
* Friendly
* Premium
* Easy to use

Users should feel like they can create beautiful branded graphics within minutes.

The interface must balance creativity and professionalism.

Avoid:

* Corporate dashboards
* Overly playful designs
* Heavy animations
* Visual clutter

---

# Brand Personality

Spotlite is:

* A creative automation platform
* A productivity tool
* A visual content generator

Brand Attributes:

* Inspiring
* Helpful
* Confident
* Modern
* Approachable

---

# Color System

## Primary

Electric Indigo

```css
#4840F0
```

Used for:

* Primary buttons
* Links
* Active states
* Focus states

---

## Secondary

Creative Purple

```css
#9C48EA
```

Used for:

* Highlights
* Badges
* Decorative elements

---

## Accent

Emerald

```css
#00C896
```

Used for:

* Success states
* Completed actions
* Positive feedback

---

## Background

Soft White

```css
#FAF8FF
```

Main application background.

---

## Surface

Pure White

```css
#FFFFFF
```

Cards, modals, inputs.

---

## Text

Primary Text

```css
#131B2E
```

Secondary Text

```css
#464556
```

Muted Text

```css
#777588
```

---

## Error

```css
#BA1A1A
```

---

# Gradients

Hero Gradient

```css
#4840F0 → #9C48EA
```

Accent Gradient

```css
#9C48EA → #00C896
```

Gradients should be used sparingly.

Never use gradients on body text.

---

# Typography

## Headings

Font Family:

Plus Jakarta Sans

---

### Hero Heading

Size:

48px

Weight:

700

Line Height:

1.1

---

### Section Heading

Size:

32px

Weight:

700

Line Height:

1.2

---

### Card Heading

Size:

24px

Weight:

600

Line Height:

1.3

---

## Body Text

Font Family:

Inter

---

### Large

18px

Weight:

400

Line Height:

1.6

---

### Medium

16px

Weight:

400

Line Height:

1.5

---

### Small

14px

Weight:

400

Line Height:

1.5

---

# Border Radius

## Buttons

16px

---

## Inputs

12px

---

## Cards

24px

---

## Modals

24px

---

## Pills

9999px

---

# Shadows

## Card

```css
0 4px 20px rgba(72,64,240,.08)
```

---

## Hover

```css
translateY(-4px)
```

and stronger shadow.

---

## Modal

```css
0 20px 50px rgba(0,0,0,.15)
```

---

# Spacing System

Base Unit

```css
4px
```

---

Spacing Scale

```css
4px
8px
16px
24px
40px
64px
```

---

# Layout Rules

Maximum Content Width

```css
1280px
```

---

Container Padding

Desktop

```css
32px
```

Mobile

```css
16px
```

---

# Light Mode

Default Theme

Background:

```css
#FAF8FF
```

Cards:

```css
#FFFFFF
```

Text:

```css
#131B2E
```

---

# Dark Mode

Background

```css
#0F172A
```

Surface

```css
#1E293B
```

Primary Text

```css
#F8FAFC
```

Secondary Text

```css
#CBD5E1
```

---

# Components

## Primary Button

Style:

* Indigo background
* White text
* Rounded 16px
* Medium shadow

States:

* Hover
* Active
* Disabled

---

## Secondary Button

Style:

* White background
* Indigo border
* Indigo text

---

## Ghost Button

Style:

* Transparent
* Indigo text

---

## Input Fields

Style:

* White background
* Thin border
* Rounded 12px

Focus:

* Indigo ring

---

## Cards

Used for:

* Projects
* Templates
* Graphics
* Analytics (Future)

Style:

* White surface
* Rounded 24px
* Soft shadow

---

## Upload Area

Style:

* Dashed border
* Large drop zone
* Upload icon
* Friendly instructions

Example:

Drop image here
or browse files

---

## Empty States

Every empty page must contain:

* Illustration
* Title
* Description
* CTA

Example:

No Templates Yet

Create your first template and start generating graphics.

---

# Template Editor

Most Important Screen

Requirements:

* Large editable canvas
* Placeholder controls
* Drag support
* Resize support

Future:

* Zoom
* Layers
* Alignment guides

Not MVP.

---

# Demo Generator

Public Page

Purpose:

Allow visitors to experience the product before signing up.

Inputs:

* Name
* Caption
* Photo

Templates:

* Student Spotlight
* Employee Spotlight
* Member Spotlight

Output:

* Generated graphic preview

Downloads should contain Spotlite branding watermark.

---

# Graphic Style Guidelines

Generated graphics should be:

* Social-media ready
* WhatsApp ready
* Clean
* Modern
* High contrast
* Mobile friendly

Avoid:

* Busy layouts
* Excessive text
* Tiny fonts
* Overly corporate visuals

---

# Accessibility

Requirements:

* WCAG AA contrast minimum
* Keyboard navigation
* Visible focus states
* Dark mode support

---

# Future Design Considerations

Not MVP:

* Template Marketplace
* Advanced Animation
* Collaborative Editing
* AI Template Suggestions
* Brand Kits
* Multi-Workspace Themes

These should not influence MVP decisions.
