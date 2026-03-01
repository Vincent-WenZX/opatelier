# Cloudinary Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Cloudinary as the file storage provider for the Orchid & Plum Medusa v2 backend, and add Cloudinary URL transformations to the Next.js storefront for optimized image delivery.

**Architecture:** A custom Medusa v2 File Provider module wraps the Cloudinary Node SDK, implementing `AbstractFileProviderService`. The storefront uses a custom Next.js image loader that detects Cloudinary URLs and appends transformation parameters (`f_auto,q_auto,w_{width}`) for automatic format/quality/size optimization.

**Tech Stack:** Medusa v2.13.x, `cloudinary` npm v2.x, Next.js 15, TypeScript

---

### Task 1: Install Cloudinary SDK dependency

**Files:**
- Modify: `orchid-plum/package.json`

**Step 1: Install the cloudinary package**

Run:
```bash
cd /Users/wzx/Documents/Orchid\&Plum/orchid-plum && npm install cloudinary
```

Expected: Package added to `dependencies` in `package.json`.

**Step 2: Commit**

```bash
cd /Users/wzx/Documents/Orchid\&Plum && git add orchid-plum/package.json orchid-plum/package-lock.json && git commit -m "feat: add cloudinary SDK dependency"
```

---

### Task 2: Add Cloudinary environment variables

**Files:**
- Modify: `orchid-plum/.env`
- Modify: `orchid-plum/.env.template`

**Step 1: Add env vars to `.env`**

Append these lines to `orchid-plum/.env`:

```
CLOUDINARY_CLOUD_NAME=depruwydx
CLOUDINARY_API_KEY=943527252166479
CLOUDINARY_API_SECRET=HPlgzA67_nojOXEuy-8N7tVvO38
CLOUDINARY_FOLDER=orchid-plum
```

**Step 2: Add env vars to `.env.template`**

Append these lines to `orchid-plum/.env.template` (without real values):

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=orchid-plum
```

**Step 3: Commit**

Only commit `.env.template` (`.env` contains secrets and should be in `.gitignore`):

```bash
cd /Users/wzx/Documents/Orchid\&Plum && git add orchid-plum/.env.template && git commit -m "feat: add Cloudinary env var template"
```

---

### Task 3: Create the Cloudinary File Provider service

**Files:**
- Create: `orchid-plum/src/modules/cloudinary-file/service.ts`

**Step 1: Create the service file**

Create `orchid-plum/src/modules/cloudinary-file/service.ts`:

```typescript
import { AbstractFileProviderService } from "@medusajs/framework/utils"
import { FileTypes, Logger } from "@medusajs/framework/types"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { Readable } from "stream"

type CloudinaryOptions = {
  cloud_name: string
  api_key: string
  api_secret: string
  folder?: string
}

type InjectedDependencies = {
  logger: Logger
}

class CloudinaryFileProviderService extends AbstractFileProviderService {
  static identifier = "cloudinary"

  protected logger_: Logger
  protected options_: CloudinaryOptions

  constructor({ logger }: InjectedDependencies, options: CloudinaryOptions) {
    super()
    this.logger_ = logger
    this.options_ = options

    cloudinary.config({
      cloud_name: options.cloud_name,
      api_key: options.api_key,
      api_secret: options.api_secret,
    })
  }

  async upload(
    file: FileTypes.ProviderUploadFileDTO
  ): Promise<FileTypes.ProviderFileResultDTO> {
    const dataUri = `data:${file.mimeType};base64,${file.content}`

    const result: UploadApiResponse = await cloudinary.uploader.upload(
      dataUri,
      {
        folder: this.options_.folder || "orchid-plum",
        resource_type: "auto",
      }
    )

    return {
      url: result.secure_url,
      key: result.public_id,
    }
  }

  async delete(
    files: FileTypes.ProviderDeleteFileDTO | FileTypes.ProviderDeleteFileDTO[]
  ): Promise<void> {
    const fileArray = Array.isArray(files) ? files : [files]

    await Promise.all(
      fileArray.map((file) =>
        cloudinary.uploader.destroy(file.fileKey, {
          resource_type: "image",
          invalidate: true,
        })
      )
    )
  }

  async getPresignedDownloadUrl(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<string> {
    return cloudinary.url(fileData.fileKey, {
      secure: true,
      resource_type: "image",
    })
  }

  async getDownloadStream(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<Readable> {
    const url = cloudinary.url(fileData.fileKey, {
      secure: true,
      resource_type: "image",
    })

    const response = await fetch(url)
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download file: ${fileData.fileKey}`)
    }

    return Readable.fromWeb(response.body as any)
  }

  async getAsBuffer(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<Buffer> {
    const url = cloudinary.url(fileData.fileKey, {
      secure: true,
      resource_type: "image",
    })

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${fileData.fileKey}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async getUploadStream(
    fileData: FileTypes.ProviderUploadStreamDTO
  ): Promise<{
    writeStream: NodeJS.WritableStream
    promise: Promise<FileTypes.ProviderFileResultDTO>
    url: string
    fileKey: string
  }> {
    let resolvePromise: (value: FileTypes.ProviderFileResultDTO) => void
    let rejectPromise: (reason: Error) => void

    const promise = new Promise<FileTypes.ProviderFileResultDTO>(
      (resolve, reject) => {
        resolvePromise = resolve
        rejectPromise = reject
      }
    )

    const writeStream = cloudinary.uploader.upload_stream(
      {
        folder: this.options_.folder || "orchid-plum",
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) {
          rejectPromise(error || new Error("Upload failed"))
          return
        }
        resolvePromise({
          url: result.secure_url,
          key: result.public_id,
        })
      }
    )

    const tempKey = `${this.options_.folder || "orchid-plum"}/${fileData.filename}`
    const tempUrl = cloudinary.url(tempKey, { secure: true })

    return {
      writeStream,
      promise,
      url: tempUrl,
      fileKey: tempKey,
    }
  }
}

export default CloudinaryFileProviderService
```

**Step 2: Commit**

```bash
cd /Users/wzx/Documents/Orchid\&Plum && git add orchid-plum/src/modules/cloudinary-file/service.ts && git commit -m "feat: implement Cloudinary file provider service"
```

---

### Task 4: Create the module provider registration

**Files:**
- Create: `orchid-plum/src/modules/cloudinary-file/index.ts`

**Step 1: Create the module registration file**

Create `orchid-plum/src/modules/cloudinary-file/index.ts`:

```typescript
import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import CloudinaryFileProviderService from "./service"

export default ModuleProvider(Modules.FILE, {
  services: [CloudinaryFileProviderService],
})
```

**Step 2: Commit**

```bash
cd /Users/wzx/Documents/Orchid\&Plum && git add orchid-plum/src/modules/cloudinary-file/index.ts && git commit -m "feat: register Cloudinary file provider module"
```

---

### Task 5: Register the Cloudinary module in Medusa config

**Files:**
- Modify: `orchid-plum/medusa-config.ts`

**Step 1: Add the file module configuration**

The current `medusa-config.ts` contains a minimal `defineConfig` call. Add the `modules` array with the Cloudinary file provider. The file should become:

```typescript
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "./src/modules/cloudinary-file",
            id: "cloudinary",
            options: {
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
              folder: process.env.CLOUDINARY_FOLDER || "orchid-plum",
            },
          },
        ],
      },
    },
  ],
})
```

**Step 2: Commit**

```bash
cd /Users/wzx/Documents/Orchid\&Plum && git add orchid-plum/medusa-config.ts && git commit -m "feat: register Cloudinary file provider in Medusa config"
```

---

### Task 6: Verify backend starts with Cloudinary provider

**Step 1: Start the Medusa dev server**

Run:
```bash
cd /Users/wzx/Documents/Orchid\&Plum/orchid-plum && npm run dev
```

Expected: Server starts on `http://localhost:9000` without errors. Look for the file module being loaded in the startup logs.

**Step 2: Test file upload via Admin**

1. Open `http://localhost:9000/app` in a browser
2. Navigate to a product
3. Try uploading an image via the product media section
4. Verify the uploaded image URL contains `res.cloudinary.com/depruwydx`

Stop the dev server after verification.

---

### Task 7: Create the Cloudinary image loader for Next.js

**Files:**
- Create: `orchid-plum-storefront/src/lib/util/cloudinary-loader.ts`

**Step 1: Create the loader file**

Create `orchid-plum-storefront/src/lib/util/cloudinary-loader.ts`:

```typescript
import type { ImageLoaderProps } from "next/image"

const CLOUDINARY_HOSTNAME = "res.cloudinary.com"

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src.includes(CLOUDINARY_HOSTNAME)) {
    return `${src}?w=${width}&q=${quality || 75}`
  }

  const transforms = `f_auto,q_${quality || "auto"},w_${width}`

  // Cloudinary URL format: https://res.cloudinary.com/{cloud}/image/upload/{existing_transforms}/{public_id}
  // Insert our transforms after /upload/
  const uploadIndex = src.indexOf("/upload/")
  if (uploadIndex === -1) {
    return src
  }

  const before = src.slice(0, uploadIndex + "/upload/".length)
  const after = src.slice(uploadIndex + "/upload/".length)

  return `${before}${transforms}/${after}`
}
```

**Step 2: Commit**

```bash
cd /Users/wzx/Documents/Orchid\&Plum && git add orchid-plum-storefront/src/lib/util/cloudinary-loader.ts && git commit -m "feat: add Cloudinary image loader for Next.js"
```

---

### Task 8: Configure Next.js to use the Cloudinary loader

**Files:**
- Modify: `orchid-plum-storefront/next.config.js`

**Step 1: Add Cloudinary to remotePatterns and set the loader**

Update `next.config.js` to add `res.cloudinary.com` to `remotePatterns`. The `images` section should become:

```javascript
  images: {
    loader: "custom",
    loaderFile: "./src/lib/util/cloudinary-loader.ts",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
```

**Step 2: Commit**

```bash
cd /Users/wzx/Documents/Orchid\&Plum && git add orchid-plum-storefront/next.config.js && git commit -m "feat: configure Next.js with Cloudinary image loader"
```

---

### Task 9: End-to-end verification

**Step 1: Start both servers**

Terminal 1:
```bash
cd /Users/wzx/Documents/Orchid\&Plum/orchid-plum && npm run dev
```

Terminal 2:
```bash
cd /Users/wzx/Documents/Orchid\&Plum/orchid-plum-storefront && npm run dev
```

**Step 2: Upload a product image via Admin**

1. Open `http://localhost:9000/app`
2. Navigate to Products, edit any product
3. Upload a new image
4. Confirm the image URL in the product data is a Cloudinary URL (`res.cloudinary.com/depruwydx/...`)

**Step 3: Verify storefront renders the image**

1. Open `http://localhost:8000`
2. Navigate to the product with the uploaded image
3. Inspect the `<img>` element in browser DevTools
4. Confirm the `src` attribute contains Cloudinary transformation params (`f_auto,q_auto,w_...`)

**Step 4: Verify image optimization**

1. Open browser DevTools Network tab
2. Load a product page
3. Check the image response headers — Content-Type should be `image/webp` or `image/avif` (from `f_auto`)
4. Image dimensions should match the requested width (from `w_...`)
