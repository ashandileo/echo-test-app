import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE,
  MISTRAL_API_BASE_URL,
} from "./consts";

// Types
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface MistralUploadResponse {
  id: string;
}

export interface MistralOCRPage {
  markdown: string;
}

export interface MistralOCRResponse {
  pages?: MistralOCRPage[];
}

// Validation
export const validateFile = (file: File): ValidationResult => {
  if (
    !ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof ACCEPTED_MIME_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Please use JPG, PNG, WebP, or PDF.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size too large: ${sizeMB}MB. Maximum allowed is 10MB.`,
    };
  }

  return { valid: true };
};

// Mistral API Functions
export const uploadFileToMistral = async (file: File): Promise<string> => {
  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  const formData = new FormData();
  const blob = new Blob([buffer], { type: file.type });
  formData.append("file", blob, file.name);
  formData.append("purpose", "ocr");

  const response = await fetch(`${MISTRAL_API_BASE_URL}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MISTERAL_API_KEY}`,
    },
    body: formData,
  });

  console.log("response", response);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`File upload failed: ${response.status} - ${errorText}`);
  }

  const result: MistralUploadResponse = await response.json();

  return result.id;
};

export const processOCR = async (fileId: string): Promise<string> => {
  const payload = {
    model: "mistral-ocr-latest",
    document: {
      type: "file",
      file_id: fileId,
    },
    include_image_base64: false,
  };

  const response = await fetch(`${MISTRAL_API_BASE_URL}/ocr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MISTERAL_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OCR processing failed: ${response.status} - ${errorText}`);
  }

  const result: MistralOCRResponse = await response.json();

  if (!result.pages || result.pages.length === 0) {
    return "";
  }

  // Merge all markdown from all pages into a single string
  const combinedMarkdown = result.pages
    .map((page) => page.markdown)
    .join("\n\n");

  return combinedMarkdown;
};
