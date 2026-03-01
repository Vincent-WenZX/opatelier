# Cloudinary Image Storage Integration Design

## Date: 2026-03-01

## Goal

Integrate Cloudinary as the file storage provider for the Orchid & Plum e-commerce platform, replacing the default local file system. This enables CDN-accelerated image delivery with automatic format/quality optimization.

## Scope

### In Scope (Phase 1)
1. **Backend**: Custom Medusa v2 File Provider Module wrapping Cloudinary SDK
2. **Frontend**: Cloudinary URL transformation loader for Next.js image optimization

### Out of Scope (Phase 2)
- Admin Cloudinary Media Library Widget (browse/search Cloudinary assets from Admin)

## Architecture

### Backend: Cloudinary File Provider

**Location**: `orchid-plum/src/modules/cloudinary-file/`

```
src/modules/cloudinary-file/
├── index.ts      # ModuleProvider registration
└── service.ts    # CloudinaryFileProviderService
```

**Service**: Extends `AbstractFileProviderService` from `@medusajs/framework/utils`

Methods:
- `upload()` - Decode base64 content, upload via `cloudinary.uploader.upload()`, return `{ url, key }`
- `delete()` - Remove file via `cloudinary.uploader.destroy()`
- `getPresignedDownloadUrl()` - Return Cloudinary public URL directly
- `getDownloadStream()` - Fetch Cloudinary URL and return readable stream
- `getAsBuffer()` - Fetch Cloudinary URL and return buffer
- `getUploadStream()` - Use `cloudinary.uploader.upload_stream()` for streaming uploads

**Configuration** in `medusa-config.ts`:
- Register as File module provider with id `cloudinary`
- Pass cloud_name, api_key, api_secret, folder from env vars

**Environment Variables** (`.env`):
- `CLOUDINARY_CLOUD_NAME=depruwydx`
- `CLOUDINARY_API_KEY=943527252166479`
- `CLOUDINARY_API_SECRET=HPlgzA67_nojOXEuy-8N7tVvO38`
- `CLOUDINARY_FOLDER=orchid-plum`

**Dependency**: `cloudinary` npm package (v2.x)

### Frontend: Cloudinary Image Optimization

**Cloudinary Loader** (`orchid-plum-storefront/src/lib/util/cloudinary-loader.ts`):
- Custom Next.js image loader function
- Detects Cloudinary URLs (domain: `res.cloudinary.com`)
- Appends transformation parameters: `f_auto,q_auto,w_{width}`
- Non-Cloudinary URLs pass through unchanged

**next.config.js** updates:
- Add `res.cloudinary.com` to `remotePatterns`
- Configure custom loader

**Zero component changes** - Existing `Thumbnail` and `ImageGallery` components continue using `next/image`, the loader handles optimization transparently.

### Data Flow

```
Admin Upload → Medusa File Module → CloudinaryFileProviderService.upload()
    → Cloudinary API → Returns URL (res.cloudinary.com/depruwydx/...)
    → Stored in product.images[].url

Storefront Request → next/image with cloudinaryLoader
    → Transforms URL: adds f_auto,q_auto,w_{width}
    → Browser loads optimized image from Cloudinary CDN
```

## Dependencies

- `cloudinary` (v2.x) - Node.js SDK for backend
- No additional frontend dependencies

## Decisions

1. **Single folder**: All uploads go to `orchid-plum/` folder in Cloudinary for organization
2. **Public access**: Product images are public (no signed URLs needed for display)
3. **Auto format/quality**: Frontend loader always applies `f_auto,q_auto` for optimal delivery
4. **No component changes**: Loader-based approach avoids modifying existing React components
