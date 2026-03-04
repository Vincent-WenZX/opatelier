import { AbstractFileProviderService } from "@medusajs/framework/utils"
import { FileTypes, Logger } from "@medusajs/framework/types"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { Readable, Writable } from "stream"

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
    writeStream: Writable
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
    ) as unknown as Writable

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
