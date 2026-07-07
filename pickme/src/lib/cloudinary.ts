/**
 * Cloudinary direct-upload helper (stub for a later stage).
 *
 * Flow (PICKME_API_REFERENCE.md §8): POST /media/signature/ to get short-lived
 * signed params, upload the file straight to Cloudinary's `upload_url`, then
 * send the returned `secure_url` back to the API (chat attachment_url, child
 * photo_url). Avatars can alternatively POST the raw file to
 * /children/{id}/photo/ and let the backend proxy.
 *
 * Wired in Stage 4 (child avatars) / Stage 7 (chat attachments).
 */
import { api } from "./api-client";

interface MediaSignature {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  signature: string;
  resource_type: string;
  upload_url: string;
}

export function getMediaSignature(
  folder: string,
  resourceType: "image" | "video" = "image",
) {
  return api.post<MediaSignature>("/media/signature/", {
    folder,
    resource_type: resourceType,
  });
}
