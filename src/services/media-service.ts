import { notImplemented } from "../internal/not-implemented.js"

export type MediaUploadOptions = {
  mediaType: string
  waitForProcessing?: boolean
}

export class MediaService {
  async upload(
    _source: Blob | ArrayBuffer | Uint8Array,
    _options: MediaUploadOptions,
  ): Promise<string> {
    throw notImplemented("media.upload")
  }
}
