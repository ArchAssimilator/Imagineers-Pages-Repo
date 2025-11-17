# Imagineers.AI Website

A modern, responsive website for Imagineers.AI built with clean HTML, CSS, and JavaScript.

## Features

- **Modern Dark Theme**: Sleek dark design with lime green accents
- **Smooth Scroll Animations**: Fade-in and slide-in effects as you scroll
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Fast & Lightweight**: No frameworks, pure HTML/CSS/JS
- **SEO Friendly**: Semantic HTML and proper meta tags

## Pages

- **About** (`index.html`) - Company overview and mission
- **CPI Training** (`cpi.html`) - Training program details
- **GenAI.StudioLab** (`genaisl.html`) - AI innovation services
- **CAIO as a Service** (`caio.html`) - Fractional Chief AI Officer services
- **Contact** (`contact.html`) - Get in touch via email

## Design

Inspired by modern SaaS landing pages with:
- Clean, minimalist layout
- High contrast for readability
- Generous whitespace
- Professional typography (Inter font family)
- Smooth transitions and animations

## Setup Instructions

### For Local Development

1. Clone this repository
2. Open `index.html` in your browser
3. No build process required!

### For GitHub Pages

1. Go to your repository Settings
2. Navigate to Pages section
3. Under "Source", select the branch you want to deploy
4. Save and wait a few minutes
5. Your site will be live at `https://username.github.io/repository-name`

## Customization Guide

### Update Content

All content marked with `[Placeholder: ...]` should be replaced with your actual content. Search for "Placeholder" in all HTML files and replace with your text.

### Update Contact Email

In `contact.html`, replace `contact@imagineers.ai` with your actual email address.

### Change Colors

Edit `styles.css` and update the CSS variables in the `:root` selector:

```css
:root {
  --color-bg-primary: #060703;      /* Main background */
  --color-accent: #9cf35b;          /* Accent color */
  --color-text-primary: #ffffff;    /* Primary text */
  /* ... more colors ... */
}
```

### Modify Layout

The site uses a grid-based layout with CSS Grid and Flexbox. Modify the grid in `styles.css`:

```css
.feature-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

## File Structure

```
.
├── index.html          # About page
├── cpi.html           # CPI Training page
├── genaisl.html       # GenAI StudioLab page
├── caio.html          # CAIO as a Service page
├── contact.html       # Contact page
├── styles.css         # Main stylesheet
├── script.js          # JavaScript for animations
└── README.md          # This file
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2025 Imagineers.AI. All rights reserved.
