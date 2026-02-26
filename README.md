# SnapVerse Web

A premium photography portfolio website built with Next.js, Tailwind CSS, and Framer Motion.

## Project Structure

- `app/`: App Router pages and layouts.
- `components/`: Reusable UI components.
  - `ui/`: Basic UI primitives (Button, Input, etc.).
  - `layout/`: Global layout components (Navbar, Footer).
  - `features/`: Feature-specific components (AlbumCard, GalleryLightbox, etc.).
- `data/`: Static data files.
- `lib/`: Utility functions.

## How to Add Albums

All album data is stored in `data/albums.ts`. To add a new album:

1.  Open `data/albums.ts`.
2.  Add a new object to the `albums` array following the `Album` interface:

```typescript
{
  slug: "your-album-slug", // Must be unique URL-friendly string
  title: "Album Title",
  category: "Wedding", // "Wedding" | "Pre-shoot" | "Birthday" | "Events" | "Commercial"
  location: "City, Country",
  year: "2024",
  coverImage: "URL_TO_COVER_IMAGE",
  description: "Short description of the album.",
  images: [
    { 
      id: "1", 
      src: "URL_TO_IMAGE", 
      alt: "Description", 
      width: 1920, 
      height: 1080 
    },
    // Add more images...
  ],
}
```

## Image Export Rules

For best performance and quality:
- **Format**: use WebP or JPG.
- **Dimensions**: 
  - Cover images: ~1920px width.
  - Gallery images: ~2000px width (for lightbox).
  - Thumbnails are automatically handled by Next.js Image component.
- **Aspect Ratio**: maintain consistent aspect ratios where possible (e.g., 3:2 landscape, 2:3 portrait) for the grid to look balanced, though the masonry layout handles variations.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

The project is ready for deployment on Vercel or any hosting supporting Next.js.
