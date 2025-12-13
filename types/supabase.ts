export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          query?: string
          extensions?: Json
          variables?: Json
          operationName?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      document_learnings: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string | null
          embedding: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          mistral_file_id: string | null
          total_chunks: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string | null
          embedding?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          mistral_file_id?: string | null
          total_chunks: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string | null
          embedding?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          mistral_file_id?: string | null
          total_chunks?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          source_document_path: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          source_document_path?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          source_document_path?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_question_essay: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          points: number
          question_text: string
          quiz_id: string
          rubric: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          points?: number
          question_text: string
          quiz_id: string
          rubric?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          points?: number
          question_text?: string
          quiz_id?: string
          rubric?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_question_essay_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_question_essay_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_enriched_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_question_essay_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_results_view"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
      quiz_question_multiple_choice: {
        Row: {
          correct_answer: string
          created_at: string | null
          deleted_at: string | null
          explanation: string | null
          id: string
          options: Json
          points: number
          question_text: string
          quiz_id: string
          updated_at: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          deleted_at?: string | null
          explanation?: string | null
          id?: string
          options: Json
          points?: number
          question_text: string
          quiz_id: string
          updated_at?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          deleted_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json
          points?: number
          question_text?: string
          quiz_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_question_multiple_choice_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_question_multiple_choice_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_enriched_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_question_multiple_choice_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_results_view"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
      quiz_submission_essay: {
        Row: {
          answer_text: string
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          points_earned: number | null
          question_id: string
          quiz_id: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer_text: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          points_earned?: number | null
          question_id: string
          quiz_id: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer_text?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          points_earned?: number | null
          question_id?: string
          quiz_id?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submission_essay_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_question_essay"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submission_essay_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submission_essay_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_enriched_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submission_essay_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_results_view"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
      quiz_submission_multiple_choice: {
        Row: {
          id: string
          is_correct: boolean
          points_earned: number
          question_id: string
          quiz_id: string
          selected_answer: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_correct: boolean
          points_earned?: number
          question_id: string
          quiz_id: string
          selected_answer: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          points_earned?: number
          question_id?: string
          quiz_id?: string
          selected_answer?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submission_multiple_choice_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_question_multiple_choice"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submission_multiple_choice_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submission_multiple_choice_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_enriched_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submission_multiple_choice_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_results_view"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
    }
    Views: {
      quiz_enriched_view: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          created_by: string | null
          creator_id: string | null
          description: string | null
          id: string | null
          is_completed: boolean | null
          published_at: string | null
          score: number | null
          status: string | null
          title: string | null
          total_answered_questions: number | null
          total_essay_questions: number | null
          total_multiple_choice_questions: number | null
          total_points: number | null
          total_questions: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      quiz_results_view: {
        Row: {
          all_essays_graded: boolean | null
          essay_answered_count: number | null
          essay_graded_count: number | null
          essay_last_submitted_at: string | null
          essay_pending_count: number | null
          essay_score: number | null
          last_submitted_at: string | null
          mc_answered_count: number | null
          mc_correct_count: number | null
          mc_last_submitted_at: string | null
          mc_score: number | null
          percentage_score: number | null
          quiz_description: string | null
          quiz_id: string | null
          quiz_name: string | null
          submission_status: string | null
          total_answered: number | null
          total_essay_points: number | null
          total_essay_questions: number | null
          total_mc_points: number | null
          total_mc_questions: number | null
          total_possible_points: number | null
          total_questions: number | null
          total_score: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      search_document_chunks: {
        Args: {
          query_embedding: string
          match_count?: number
          match_user_id: string
        }
        Returns: {
          total_chunks: number
          chunk_index: number
          chunk_text: string
          file_path: string
          similarity: number
          file_name: string
          user_id: string
          id: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

