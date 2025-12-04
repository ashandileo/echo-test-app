import { NextResponse } from "next/server";
import { processOCR, uploadFileToMistral, validateFile } from "./../utils";

export async function POST(request: Request) {
  try {
    // Parse and validate request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a file." },
        { status: 400 }
      );
    }

    // Validate file type and size
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Process OCR
    const fileId = await uploadFileToMistral(file);
    const markdown = await processOCR(fileId);

    return NextResponse.json({
      markdown,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      fileId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process file.", rawError: error },
      { status: 500 }
    );
  }
}
