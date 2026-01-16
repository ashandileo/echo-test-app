import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { deleteAudioFromR2 } from "@/lib/utils/r2-audio-storage";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("filePath");

    if (!filePath) {
      return NextResponse.json(
        { success: false, message: "File path is required" },
        { status: 400 }
      );
    }

    // Verify the file belongs to the user (check if path starts with userId)
    if (!filePath.startsWith(user.id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized: Cannot delete file that doesn't belong to you",
        },
        { status: 403 }
      );
    }

    // Delete from R2
    await deleteAudioFromR2(filePath);

    return NextResponse.json({
      success: true,
      message: "Audio file deleted successfully",
    });
  } catch (error) {
    console.error("Delete audio error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 }
    );
  }
}
