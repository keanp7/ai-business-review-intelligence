import { SUPABASE_URL } from "./_publicConfigs";

// NOTE: This helper is backend-only. Do not import in client-side code.

const BUCKET_NAME = "verification-documents";

/**
 * Gets the Supabase Service Role Key from environment variables.
 * Throws if not found, ensuring we don't accidentally make unauthenticated requests.
 */
const getServiceRoleKey = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables."
    );
  }
  return key;
};

// Lazy initialization flag
let bucketEnsured = false;

/**
 * Helper to construct common headers for Supabase Storage API
 */
const getHeaders = (
  contentType: string = "application/json",
  upsert: boolean = false
) => {
  const key = getServiceRoleKey();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    apikey: key,
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (upsert) {
    headers["x-upsert"] = "true";
  }

  return headers;
};

/**
 * Creates the bucket if it doesn't exist.
 * This is called lazily before upload operations.
 */
const ensureBucket = async (): Promise<void> => {
  if (bucketEnsured) return;

  console.log(`[SupabaseStorage] Ensuring bucket '${BUCKET_NAME}' exists...`);

  try {
    // Check if bucket exists first usually, or just try to create it.
    // The API to create a bucket is POST /storage/v1/bucket
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: "POST",
      headers: getHeaders("application/json"),
      body: JSON.stringify({
        id: BUCKET_NAME,
        name: BUCKET_NAME,
        public: false, // Private bucket
                file_size_limit: 10485760, // 10MB limit
        allowed_mime_types: ["image/*", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      }),
    });

    if (response.ok) {
      console.log(`[SupabaseStorage] Bucket '${BUCKET_NAME}' created.`);
      bucketEnsured = true;
    } else if (response.status === 409 || response.status === 400) {
      // 409 Conflict usually means it already exists.
      // Sometimes 400 if ID is invalid but "Duplicate" is common.
      // We assume it's fine if it fails with conflict.
      console.log(
        `[SupabaseStorage] Bucket '${BUCKET_NAME}' likely already exists (Status: ${response.status}).`
      );
      bucketEnsured = true;
    } else {
      const errorText = await response.text();
      console.error(
        `[SupabaseStorage] Failed to create bucket: ${response.status} ${errorText}`
      );
      // We don't throw here strictly to allow retry or ignore if it's a transient issue,
      // but usually this is fatal for upload.
      throw new Error(`Failed to ensure bucket: ${errorText}`);
    }
  } catch (error) {
    console.error(`[SupabaseStorage] Error ensuring bucket:`, error);
    throw error;
  }
};

/**
 * Uploads a file to Supabase Storage.
 *
 * @param storagePath - The full path including filename (e.g., 'claims/123/doc.pdf')
 * @param fileData - The base64 data URL (e.g., 'data:image/png;base64,.....')
 * @param fileType - The MIME type (e.g., 'application/pdf')
 * @returns The storage path on success
 */
const uploadFile = async (
  storagePath: string,
  fileData: string,
  fileType: string
): Promise<string> => {
  await ensureBucket();

  // Strip the prefix if present (data:contentType;base64,...)
  const base64Data = fileData.replace(/^data:.*?;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  console.log(
    `[SupabaseStorage] Uploading file to ${BUCKET_NAME}/${storagePath}...`
  );

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${storagePath}`,
    {
      method: "POST",
      headers: getHeaders(fileType, true), // x-upsert: true
      body: buffer,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[SupabaseStorage] Upload failed: ${response.status} ${errorText}`
    );
    throw new Error(`Upload failed: ${errorText}`);
  }

  // The response usually contains Key, but we know the path.
  // We return the clean storagePath for reference.
  return storagePath;
};

/**
 * Generates a signed URL for a private file.
 *
 * @param storagePath - The path to the file
 * @param expiresIn - Expiration in seconds (default 3600)
 * @returns The full signed URL
 */
const getSignedUrl = async (
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> => {
  console.log(
    `[SupabaseStorage] Generating signed URL for ${BUCKET_NAME}/${storagePath}...`
  );

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/sign/${BUCKET_NAME}/${storagePath}`,
    {
      method: "POST",
      headers: getHeaders("application/json"),
      body: JSON.stringify({ expiresIn }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[SupabaseStorage] Signed URL generation failed: ${response.status} ${errorText}`
    );
    throw new Error(`Failed to get signed URL: ${errorText}`);
  }

  const data = await response.json();
  // Supabase returns { signedURL: "/storage/v1/object/sign/..." } relative path usually
  // We need to construct the full URL.
  // Note: The returned signedURL usually includes the path prefix.
  // It looks like: /storage/v1/object/sign/bucket/path?token=...

  // We need to prepend the SUPABASE_URL if it's a relative path
  let fullUrl = data.signedURL;
  if (fullUrl.startsWith("/")) {
    fullUrl = `${SUPABASE_URL}${fullUrl}`;
  }

  return fullUrl;
};

/**
 * Downloads a file directly as a Buffer.
 * Useful for server-side processing or re-serving.
 *
 * @param storagePath - The path to the file
 */
const downloadFile = async (
  storagePath: string
): Promise<{ data: Buffer; contentType: string }> => {
  console.log(
    `[SupabaseStorage] Downloading file from ${BUCKET_NAME}/${storagePath}...`
  );

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${storagePath}`,
    {
      method: "GET",
      headers: getHeaders(""), // No content-type for GET usually, or accept
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[SupabaseStorage] Download failed: ${response.status} ${errorText}`
    );
    throw new Error(`Download failed: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType =
    response.headers.get("Content-Type") || "application/octet-stream";

  return { data: buffer, contentType };
};

/**
 * Deletes a file from storage.
 *
 * @param storagePath - The path to the file to delete
 */
const deleteFile = async (storagePath: string): Promise<void> => {
  console.log(
    `[SupabaseStorage] Deleting file at ${BUCKET_NAME}/${storagePath}...`
  );

  // Supabase Storage v1 API delete is DELETE /object/{bucket} with body { prefixes: [path] }
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}`,
    {
      method: "DELETE",
      headers: getHeaders("application/json"),
      body: JSON.stringify({ prefixes: [storagePath] }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[SupabaseStorage] Delete failed: ${response.status} ${errorText}`
    );
    throw new Error(`Delete failed: ${errorText}`);
  }

  console.log(`[SupabaseStorage] File deleted successfully.`);
};

export const supabaseStorage = {
  uploadFile,
  getSignedUrl,
  downloadFile,
  deleteFile,
  ensureBucket,
};