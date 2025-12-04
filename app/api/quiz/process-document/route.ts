import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "./consts";
import {
  validateRequest,
  uploadFileToStorage,
  chunkDocument,
  createDocumentChunks,
  saveDocumentChunks,
  getFilePublicUrl,
  type ProcessDocumentRequest,
} from "./utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body: ProcessDocumentRequest = await request.json();
    const validation = validateRequest(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { markdown, fileName, fileSize, fileType, mistralFileId, file } =
      body;

    // Step 1: Upload file to Supabase Storage
    const uploadResult = await uploadFileToStorage(
      file,
      fileName,
      fileType,
      user.id
    );

    if (uploadResult.error) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    const { filePath } = uploadResult;

    // Step 2: Chunk the markdown text
    const chunks = chunkDocument(markdown);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_CHUNKS_GENERATED },
        { status: 400 }
      );
    }

    // Step 3: Generate embeddings for each chunk
    const documentChunks = await createDocumentChunks(
      chunks,
      user.id,
      fileName,
      filePath,
      fileSize,
      fileType,
      mistralFileId
    );

    // Step 4: Save all chunks with embeddings to database
    const saveResult = await saveDocumentChunks(documentChunks);

    if (!saveResult.success || !saveResult.data) {
      return NextResponse.json(
        { error: saveResult.error || ERROR_MESSAGES.DATABASE_INSERT_FAILED },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const fileUrl = await getFilePublicUrl(filePath);

    console.log(
      `Successfully processed document with ${documentChunks.length} chunks`
    );

    return NextResponse.json({
      success: true,
      message: "Document processed and embeddings generated successfully",
      data: {
        documentId: saveResult.data[0]?.id,
        fileName: fileName,
        filePath: filePath,
        fileUrl: fileUrl,
        totalChunks: chunks.length,
        chunksProcessed: documentChunks.length,
      },
    });
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.PROCESSING_FAILED,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
