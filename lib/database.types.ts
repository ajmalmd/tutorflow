export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      session_debriefs: {
        Row: {
          created_at: string
          homework: Json
          id: string
          model: string | null
          next_focus: string
          session_id: string
          summary: string
        }
        Insert: {
          created_at?: string
          homework: Json
          id?: string
          model?: string | null
          next_focus: string
          session_id: string
          summary: string
        }
        Update: {
          created_at?: string
          homework?: Json
          id?: string
          model?: string | null
          next_focus?: string
          session_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_debriefs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_plans: {
        Row: {
          created_at: string
          id: string
          lesson_outline: Json
          model: string | null
          objectives: Json
          practice_questions: Json
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_outline: Json
          model?: string | null
          objectives: Json
          practice_questions: Json
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_outline?: Json
          model?: string | null
          objectives?: Json
          practice_questions?: Json
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_plans_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          ends_at: string
          id: string
          live_notes: string
          reviewed_at: string | null
          starts_at: string
          status: Database["public"]["Enums"]["session_status"]
          student_id: string
          topic: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          ends_at: string
          id?: string
          live_notes?: string
          reviewed_at?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["session_status"]
          student_id: string
          topic: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          live_notes?: string
          reviewed_at?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          student_id?: string
          topic?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          current_level: string
          id: string
          learning_goals: string
          name: string
          subject: string
          tutor_id: string
          updated_at: string
          user_id: string
          weak_areas: string
        }
        Insert: {
          created_at?: string
          current_level: string
          id?: string
          learning_goals?: string
          name: string
          subject: string
          tutor_id: string
          updated_at?: string
          user_id: string
          weak_areas?: string
        }
        Update: {
          created_at?: string
          current_level?: string
          id?: string
          learning_goals?: string
          name?: string
          subject?: string
          tutor_id?: string
          updated_at?: string
          user_id?: string
          weak_areas?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_session: {
        Args: { p_session_id: string }
        Returns: {
          completed_at: string | null
          created_at: string
          ends_at: string
          id: string
          live_notes: string
          reviewed_at: string | null
          starts_at: string
          status: Database["public"]["Enums"]["session_status"]
          student_id: string
          topic: string
          tutor_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      find_auth_user_by_email: { Args: { p_email: string }; Returns: string }
      get_my_session_debriefs: {
        Args: never
        Returns: {
          created_at: string
          homework: Json
          id: string
          next_focus: string
          session_id: string
          summary: string
        }[]
      }
      get_my_sessions: {
        Args: never
        Returns: {
          completed_at: string
          created_at: string
          ends_at: string
          id: string
          reviewed_at: string
          starts_at: string
          status: Database["public"]["Enums"]["session_status"]
          topic: string
        }[]
      }
      save_session_debrief_and_review: {
        Args: {
          p_homework: Json
          p_model: string
          p_next_focus: string
          p_session_id: string
          p_summary: string
        }
        Returns: {
          created_at: string
          homework: Json
          id: string
          model: string | null
          next_focus: string
          session_id: string
          summary: string
        }
        SetofOptions: {
          from: "*"
          to: "session_debriefs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_session_live_notes: {
        Args: { p_live_notes: string; p_session_id: string }
        Returns: {
          completed_at: string | null
          created_at: string
          ends_at: string
          id: string
          live_notes: string
          reviewed_at: string | null
          starts_at: string
          status: Database["public"]["Enums"]["session_status"]
          student_id: string
          topic: string
          tutor_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_session_plan: {
        Args: {
          p_lesson_outline: Json
          p_model: string
          p_objectives: Json
          p_practice_questions: Json
          p_session_id: string
        }
        Returns: {
          created_at: string
          id: string
          lesson_outline: Json
          model: string | null
          objectives: Json
          practice_questions: Json
          session_id: string
        }
        SetofOptions: {
          from: "*"
          to: "session_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_session: {
        Args: { p_session_id: string }
        Returns: {
          completed_at: string | null
          created_at: string
          ends_at: string
          id: string
          live_notes: string
          reviewed_at: string | null
          starts_at: string
          status: Database["public"]["Enums"]["session_status"]
          student_id: string
          topic: string
          tutor_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      session_status: "scheduled" | "in_progress" | "completed" | "ai_reviewed"
      user_role: "tutor" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      session_status: ["scheduled", "in_progress", "completed", "ai_reviewed"],
      user_role: ["tutor", "student"],
    },
  },
} as const
