export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      backups: {
        Row: {
          created_at: string
          file_path: string | null
          id: string
          name: string
          quality: number | null
          shared_count: number | null
          size: number | null
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          id?: string
          name: string
          quality?: number | null
          shared_count?: number | null
          size?: number | null
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          id?: string
          name?: string
          quality?: number | null
          shared_count?: number | null
          size?: number | null
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          shares_count: number
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          shares_count?: number
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          shares_count?: number
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          avatar: string | null
          banner: string | null
          created_at: string
          id: string
          role: string | null
          subscriber_count: number | null
          username: string | null
          verified: boolean | null
          video_count: number | null
        }
        Insert: {
          about?: string | null
          avatar?: string | null
          banner?: string | null
          created_at?: string
          id: string
          role?: string | null
          subscriber_count?: number | null
          username?: string | null
          verified?: boolean | null
          video_count?: number | null
        }
        Update: {
          about?: string | null
          avatar?: string | null
          banner?: string | null
          created_at?: string
          id?: string
          role?: string | null
          subscriber_count?: number | null
          username?: string | null
          verified?: boolean | null
          video_count?: number | null
        }
        Relationships: []
      }
      saved_videos: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          subscriber_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          subscriber_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          subscriber_id?: string
        }
        Relationships: []
      }
      video_likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_reports_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_views: {
        Row: {
          duration_watched: number | null
          id: string
          ip_address: unknown | null
          quality_watched: string | null
          user_id: string | null
          video_id: string
          viewed_at: string
        }
        Insert: {
          duration_watched?: number | null
          id?: string
          ip_address?: unknown | null
          quality_watched?: string | null
          user_id?: string | null
          video_id: string
          viewed_at?: string
        }
        Update: {
          duration_watched?: number | null
          id?: string
          ip_address?: unknown | null
          quality_watched?: string | null
          user_id?: string | null
          video_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: string | null
          created_at: string
          default_quality: string | null
          description: string | null
          dislikes: number
          duration: number | null
          id: string
          is_live: boolean | null
          is_short: boolean | null
          likes: number
          quality_levels: Json | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
          views: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          default_quality?: string | null
          description?: string | null
          dislikes?: number
          duration?: number | null
          id?: string
          is_live?: boolean | null
          is_short?: boolean | null
          likes?: number
          quality_levels?: Json | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
          views?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          default_quality?: string | null
          description?: string | null
          dislikes?: number
          duration?: number | null
          id?: string
          is_live?: boolean | null
          is_short?: boolean | null
          likes?: number
          quality_levels?: Json | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
          views?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_video_views: {
        Args: { video_uuid: string }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
