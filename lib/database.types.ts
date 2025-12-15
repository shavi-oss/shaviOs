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
    PostgrestVersion: "13.0.5"
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
      ad_campaigns: {
        Row: {
          clicks: number | null
          cost_per_lead: number | null
          cpc: number | null
          created_at: string
          ctr: number | null
          currency: string | null
          daily_budget: number | null
          end_date: string | null
          external_id: string
          id: string
          impressions: number | null
          leads: number | null
          name: string
          platform: string
          roas: number | null
          start_date: string | null
          status: string
          total_spend: number | null
          updated_at: string
        }
        Insert: {
          clicks?: number | null
          cost_per_lead?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          currency?: string | null
          daily_budget?: number | null
          end_date?: string | null
          external_id: string
          id?: string
          impressions?: number | null
          leads?: number | null
          name: string
          platform: string
          roas?: number | null
          start_date?: string | null
          status: string
          total_spend?: number | null
          updated_at?: string
        }
        Update: {
          clicks?: number | null
          cost_per_lead?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          currency?: string | null
          daily_budget?: number | null
          end_date?: string | null
          external_id?: string
          id?: string
          impressions?: number | null
          leads?: number | null
          name?: string
          platform?: string
          roas?: number | null
          start_date?: string | null
          status?: string
          total_spend?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          max_score: number | null
          session_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          max_score?: number | null
          session_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          max_score?: number | null
          session_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          reason: string | null
          record_id: string
          request_id: string | null
          table_name: string
          user_agent: string | null
          user_department: string | null
          user_email: string
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
          record_id: string
          request_id?: string | null
          table_name: string
          user_agent?: string | null
          user_department?: string | null
          user_email: string
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
          record_id?: string
          request_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_department?: string | null
          user_email?: string
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          allocated: number
          category: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          department: string
          fiscal_year: number
          id: string
          notes: string | null
          owner_id: string | null
          period: string
          remaining: number | null
          spent: number | null
          status: string | null
          subcategory: string | null
          updated_at: string
          utilization: number | null
        }
        Insert: {
          allocated: number
          category: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          department: string
          fiscal_year: number
          id?: string
          notes?: string | null
          owner_id?: string | null
          period: string
          remaining?: number | null
          spent?: number | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string
          utilization?: number | null
        }
        Update: {
          allocated?: number
          category?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string
          fiscal_year?: number
          id?: string
          notes?: string | null
          owner_id?: string | null
          period?: string
          remaining?: number | null
          spent?: number | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string
          utilization?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          assigned_to: string | null
          budget: number
          clicks: number | null
          conversions: number | null
          created_at: string
          created_by: string
          ctr: number | null
          deleted_at: string | null
          deleted_by: string | null
          department: string | null
          end_date: string
          id: string
          impressions: number | null
          name: string
          remaining: number | null
          spent: number | null
          start_date: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget: number
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          created_by: string
          ctr?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          end_date: string
          id?: string
          impressions?: number | null
          name: string
          remaining?: number | null
          spent?: number | null
          start_date: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget?: number
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          created_by?: string
          ctr?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          end_date?: string
          id?: string
          impressions?: number | null
          name?: string
          remaining?: number | null
          spent?: number | null
          start_date?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_feedback: {
        Row: {
          class_id: string | null
          comments: string | null
          created_at: string
          id: string
          rating: number | null
          student_name: string | null
        }
        Insert: {
          class_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          student_name?: string | null
        }
        Update: {
          class_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          student_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_feedback_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          color_code: string | null
          course_code: string | null
          created_at: string
          description: string | null
          end_time: string
          enrolled_count: number | null
          id: string
          max_students: number | null
          meeting_link: string | null
          meeting_platform: string | null
          room_id: string | null
          start_time: string
          status: string | null
          title: string
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          course_code?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          enrolled_count?: number | null
          id?: string
          max_students?: number | null
          meeting_link?: string | null
          meeting_platform?: string | null
          room_id?: string | null
          start_time: string
          status?: string | null
          title: string
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          course_code?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          enrolled_count?: number | null
          id?: string
          max_students?: number | null
          meeting_link?: string | null
          meeting_platform?: string | null
          room_id?: string | null
          start_time?: string
          status?: string | null
          title?: string
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          created_at: string
          id: string
          min_deal_value: number | null
          percentage: number
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_deal_value?: number | null
          percentage?: number
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          min_deal_value?: number | null
          percentage?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          approved_by: string | null
          created_at: string
          currency: string
          deal_id: string | null
          employee_id: string
          id: string
          notes: string | null
          paid_at: string | null
          pay_period: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          currency?: string
          deal_id?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          pay_period?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          currency?: string
          deal_id?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          pay_period?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sessions: {
        Row: {
          course_id: string
          created_at: string
          end_date: string
          end_time: string | null
          id: string
          max_students: number | null
          name: string
          schedule_days: string[] | null
          start_date: string
          start_time: string | null
          status: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          end_date: string
          end_time?: string | null
          id?: string
          max_students?: number | null
          name: string
          schedule_days?: string[] | null
          start_date: string
          start_time?: string | null
          status?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          end_date?: string
          end_time?: string | null
          id?: string
          max_students?: number | null
          name?: string
          schedule_days?: string[] | null
          start_date?: string
          start_time?: string | null
          status?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_sessions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          duration_weeks: number
          id: string
          level: string
          price: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          description?: string | null
          duration_weeks: number
          id?: string
          level: string
          price?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          duration_weeks?: number
          id?: string
          level?: string
          price?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      deal_activities: {
        Row: {
          content: string
          deal_id: string | null
          id: string
          occurred_at: string
          performed_by: string | null
          type: string
        }
        Insert: {
          content: string
          deal_id?: string | null
          id?: string
          occurred_at?: string
          performed_by?: string | null
          type: string
        }
        Update: {
          content?: string
          deal_id?: string | null
          id?: string
          occurred_at?: string
          performed_by?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_files: {
        Row: {
          created_at: string
          deal_id: string | null
          id: string
          name: string
          size: number | null
          type: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          id?: string
          name: string
          size?: number | null
          type?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          id?: string
          name?: string
          size?: number | null
          type?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_files_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          assigned_to_id: string | null
          created_at: string
          currency: string | null
          customer_company: string | null
          customer_name: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          stage: string
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          actual_close_date?: string | null
          assigned_to_id?: string | null
          created_at?: string
          currency?: string | null
          customer_company?: string | null
          customer_name?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          stage?: string
          title: string
          updated_at?: string
          value?: number
        }
        Update: {
          actual_close_date?: string | null
          assigned_to_id?: string | null
          created_at?: string
          currency?: string | null
          customer_company?: string | null
          customer_name?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          stage?: string
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          bounced: number | null
          campaign_id: string | null
          click_rate: number | null
          clicked: number | null
          content: string
          created_at: string
          deleted_at: string | null
          delivered: number | null
          delivery_rate: number | null
          id: string
          open_rate: number | null
          opened: number | null
          preview_text: string | null
          recipients: number | null
          scheduled_date: string | null
          sent: number | null
          sent_date: string | null
          status: string | null
          subject: string
          template_id: string | null
          unsubscribed: number | null
          updated_at: string
        }
        Insert: {
          bounced?: number | null
          campaign_id?: string | null
          click_rate?: number | null
          clicked?: number | null
          content: string
          created_at?: string
          deleted_at?: string | null
          delivered?: number | null
          delivery_rate?: number | null
          id?: string
          open_rate?: number | null
          opened?: number | null
          preview_text?: string | null
          recipients?: number | null
          scheduled_date?: string | null
          sent?: number | null
          sent_date?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          unsubscribed?: number | null
          updated_at?: string
        }
        Update: {
          bounced?: number | null
          campaign_id?: string | null
          click_rate?: number | null
          clicked?: number | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          delivered?: number | null
          delivery_rate?: number | null
          id?: string
          open_rate?: number | null
          opened?: number | null
          preview_text?: string | null
          recipients?: number | null
          scheduled_date?: string | null
          sent?: number | null
          sent_date?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          unsubscribed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          annual_leave_balance: number
          created_at: string
          currency: string | null
          department: string
          email: string
          first_name: string
          id: string
          join_date: string
          last_name: string
          phone: string | null
          position: string
          salary: number | null
          sick_leave_balance: number
          status: string
          updated_at: string
        }
        Insert: {
          annual_leave_balance?: number
          created_at?: string
          currency?: string | null
          department: string
          email: string
          first_name: string
          id?: string
          join_date?: string
          last_name: string
          phone?: string | null
          position: string
          salary?: number | null
          sick_leave_balance?: number
          status?: string
          updated_at?: string
        }
        Update: {
          annual_leave_balance?: number
          created_at?: string
          currency?: string | null
          department?: string
          email?: string
          first_name?: string
          id?: string
          join_date?: string
          last_name?: string
          phone?: string | null
          position?: string
          salary?: number | null
          sick_leave_balance?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          enrolled_at: string
          grade: number | null
          id: string
          session_id: string
          status: string
          student_id: string
        }
        Insert: {
          enrolled_at?: string
          grade?: number | null
          id?: string
          session_id: string
          status?: string
          student_id: string
        }
        Update: {
          enrolled_at?: string
          grade?: number | null
          id?: string
          session_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          component_stack: string | null
          created_at: string
          endpoint: string | null
          id: string
          ip_address: unknown
          message: string
          method: string | null
          request_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          stack: string | null
          type: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_stack?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          ip_address?: unknown
          message: string
          method?: string | null
          request_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          stack?: string | null
          type: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_stack?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          ip_address?: unknown
          message?: string
          method?: string | null
          request_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          stack?: string | null
          type?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          comments: string | null
          created_at: string
          criteria: Json | null
          id: string
          score: number | null
          session_id: string | null
          student_id: string | null
          student_name: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string
          criteria?: Json | null
          id?: string
          score?: number | null
          session_id?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string
          criteria?: Json | null
          id?: string
          score?: number | null
          session_id?: string | null
          student_id?: string | null
          student_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          additional_docs: string[] | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          budget_id: string | null
          category: string
          created_at: string
          currency: string | null
          deleted_at: string | null
          deleted_by: string | null
          department: string | null
          description: string
          expense_date: string
          id: string
          payment_method: string | null
          receipt_url: string | null
          reimbursed_at: string | null
          rejection_reason: string | null
          status: string
          subcategory: string | null
          submitted_at: string | null
          submitted_by: string
          updated_at: string
        }
        Insert: {
          additional_docs?: string[] | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          budget_id?: string | null
          category: string
          created_at?: string
          currency?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          description: string
          expense_date: string
          id?: string
          payment_method?: string | null
          receipt_url?: string | null
          reimbursed_at?: string | null
          rejection_reason?: string | null
          status?: string
          subcategory?: string | null
          submitted_at?: string | null
          submitted_by: string
          updated_at?: string
        }
        Update: {
          additional_docs?: string[] | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          budget_id?: string | null
          category?: string
          created_at?: string
          currency?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          description?: string
          expense_date?: string
          id?: string
          payment_method?: string | null
          receipt_url?: string | null
          reimbursed_at?: string | null
          rejection_reason?: string | null
          status?: string
          subcategory?: string | null
          submitted_at?: string | null
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          preventive_action: string | null
          reported_by: string | null
          resolution_time: unknown
          responsible_party: string | null
          root_cause: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          preventive_action?: string | null
          reported_by?: string | null
          resolution_time?: unknown
          responsible_party?: string | null
          root_cause?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          preventive_action?: string | null
          reported_by?: string | null
          resolution_time?: unknown
          responsible_party?: string | null
          root_cause?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_credentials: {
        Row: {
          access_token: string | null
          client_id: string | null
          client_secret: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          refresh_token: string | null
          service: string
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          service: string
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          service?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          name: string
          secret_id: string | null
          slug: string
          status: string | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name: string
          secret_id?: string | null
          slug: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name?: string
          secret_id?: string | null
          slug?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_secret_id_fkey"
            columns: ["secret_id"]
            isOneToOne: false
            referencedRelation: "system_secrets"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          invoice_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string
          due_date: string
          id: string
          invoice_number: number
          items: Json | null
          paid_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name: string
          due_date: string
          id?: string
          invoice_number?: number
          items?: Json | null
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string
          due_date?: string
          id?: string
          invoice_number?: number
          items?: Json | null
          paid_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          lead_id: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          lead_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_contact: string | null
          last_name: string
          notes: string | null
          phone: string | null
          source: string
          status: string
          temperature: string | null
          total_score: number | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_contact?: string | null
          last_name: string
          notes?: string | null
          phone?: string | null
          source?: string
          status?: string
          temperature?: string | null
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_contact?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          source?: string
          status?: string
          temperature?: string | null
          total_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachment_url: string | null
          created_at: string
          days: number
          deleted_at: string | null
          deleted_by: string | null
          department: string | null
          employee_id: string
          employee_notified: boolean | null
          end_date: string
          id: string
          manager_notified: boolean | null
          reason: string
          rejection_reason: string | null
          start_date: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          created_at?: string
          days: number
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          employee_id: string
          employee_notified?: boolean | null
          end_date: string
          id?: string
          manager_notified?: boolean | null
          reason: string
          rejection_reason?: string | null
          start_date: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          created_at?: string
          days?: number
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          employee_id?: string
          employee_notified?: boolean | null
          end_date?: string
          id?: string
          manager_notified?: boolean | null
          reason?: string
          rejection_reason?: string | null
          start_date?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_notifications: {
        Row: {
          channel: string
          config: Json | null
          created_at: string
          events: string[] | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          channel: string
          config?: Json | null
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          channel?: string
          config?: Json | null
          created_at?: string
          events?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          priority: string | null
          read: boolean | null
          read_at: string | null
          related_id: string | null
          related_table: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          related_id?: string | null
          related_table?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          related_id?: string | null
          related_table?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payroll_records: {
        Row: {
          allowances: number | null
          approved_by: string | null
          base_salary: number
          bonuses: number | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          department: string | null
          employee_id: string
          gross_salary: number | null
          id: string
          insurance: number | null
          net_salary: number | null
          notes: string | null
          other_deductions: number | null
          overtime_amount: number | null
          overtime_hours: number | null
          paid_date: string | null
          payment_method: string | null
          period: string
          period_end: string
          period_start: string
          status: string
          tax: number | null
          total_deductions: number | null
          updated_at: string
        }
        Insert: {
          allowances?: number | null
          approved_by?: string | null
          base_salary: number
          bonuses?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          employee_id: string
          gross_salary?: number | null
          id?: string
          insurance?: number | null
          net_salary?: number | null
          notes?: string | null
          other_deductions?: number | null
          overtime_amount?: number | null
          overtime_hours?: number | null
          paid_date?: string | null
          payment_method?: string | null
          period: string
          period_end: string
          period_start: string
          status?: string
          tax?: number | null
          total_deductions?: number | null
          updated_at?: string
        }
        Update: {
          allowances?: number | null
          approved_by?: string | null
          base_salary?: number
          bonuses?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          employee_id?: string
          gross_salary?: number | null
          id?: string
          insurance?: number | null
          net_salary?: number | null
          notes?: string | null
          other_deductions?: number | null
          overtime_amount?: number | null
          overtime_hours?: number | null
          paid_date?: string | null
          payment_method?: string | null
          period?: string
          period_end?: string
          period_start?: string
          status?: string
          tax?: number | null
          total_deductions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          acknowledged_at: string | null
          areas_for_improvement: string | null
          communication: number | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          department: string | null
          employee_acknowledged: boolean | null
          employee_comments: string | null
          employee_id: string
          feedback: string
          goals: string | null
          id: string
          leadership: number | null
          next_review_date: string | null
          overall_rating: number
          period: string
          problem_solving: number | null
          review_date: string | null
          review_type: string | null
          reviewer_id: string
          status: string
          strengths: string | null
          teamwork: number | null
          technical_skills: number | null
          time_management: number | null
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          areas_for_improvement?: string | null
          communication?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          employee_acknowledged?: boolean | null
          employee_comments?: string | null
          employee_id: string
          feedback: string
          goals?: string | null
          id?: string
          leadership?: number | null
          next_review_date?: string | null
          overall_rating: number
          period: string
          problem_solving?: number | null
          review_date?: string | null
          review_type?: string | null
          reviewer_id: string
          status?: string
          strengths?: string | null
          teamwork?: number | null
          technical_skills?: number | null
          time_management?: number | null
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          areas_for_improvement?: string | null
          communication?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          department?: string | null
          employee_acknowledged?: boolean | null
          employee_comments?: string | null
          employee_id?: string
          feedback?: string
          goals?: string | null
          id?: string
          leadership?: number | null
          next_review_date?: string | null
          overall_rating?: number
          period?: string
          problem_solving?: number | null
          review_date?: string | null
          review_type?: string | null
          reviewer_id?: string
          status?: string
          strengths?: string | null
          teamwork?: number | null
          technical_skills?: number | null
          time_management?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          position: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          position: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string
          created_by: string | null
          deal_id: string | null
          id: string
          items: Json
          notes: string | null
          quote_number: number
          status: string
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          quote_number?: number
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          quote_number?: number
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          resources: string[] | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          resources?: string[] | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          resources?: string[] | null
        }
        Relationships: []
      }
      sales_goals: {
        Row: {
          created_at: string
          current_amount: number | null
          end_date: string
          id: string
          period: string
          start_date: string
          target_amount: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_amount?: number | null
          end_date: string
          id?: string
          period: string
          start_date: string
          target_amount: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_amount?: number | null
          end_date?: string
          id?: string
          period?: string
          start_date?: string
          target_amount?: number
          user_id?: string | null
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          access_token: string | null
          avatar_url: string | null
          created_at: string
          id: string
          is_connected: boolean | null
          page_id: string | null
          page_name: string | null
          platform: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          username: string
        }
        Insert: {
          access_token?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          page_id?: string | null
          page_name?: string | null
          platform: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          access_token?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          page_id?: string | null
          page_name?: string | null
          platform?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      social_conversations: {
        Row: {
          external_thread_id: string | null
          id: string
          last_message: string | null
          participant_name: string | null
          platform: string
          unread_count: number | null
          updated_at: string
        }
        Insert: {
          external_thread_id?: string | null
          id?: string
          last_message?: string | null
          participant_name?: string | null
          platform: string
          unread_count?: number | null
          updated_at?: string
        }
        Update: {
          external_thread_id?: string | null
          id?: string
          last_message?: string | null
          participant_name?: string | null
          platform?: string
          unread_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          account_id: string | null
          clicks: number | null
          comments: number | null
          content: string | null
          created_at: string
          external_post_id: string | null
          id: string
          likes: number | null
          media_url: string | null
          published_at: string | null
          shares: number | null
          status: string | null
        }
        Insert: {
          account_id?: string | null
          clicks?: number | null
          comments?: number | null
          content?: string | null
          created_at?: string
          external_post_id?: string | null
          id?: string
          likes?: number | null
          media_url?: string | null
          published_at?: string | null
          shares?: number | null
          status?: string | null
        }
        Update: {
          account_id?: string | null
          clicks?: number | null
          comments?: number | null
          content?: string | null
          created_at?: string
          external_post_id?: string | null
          id?: string
          likes?: number | null
          media_url?: string | null
          published_at?: string | null
          shares?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          email: string | null
          enrollment_date: string
          full_name: string
          id: string
          phone: string | null
          progress: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          enrollment_date?: string
          full_name: string
          id?: string
          phone?: string | null
          progress?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          enrollment_date?: string
          full_name?: string
          id?: string
          phone?: string | null
          progress?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_automations: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event: string
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to_id: string | null
          assigned_to_name: string | null
          created_at: string
          description: string | null
          id: string
          priority: string
          status: string
          student_email: string | null
          student_id: string | null
          student_name: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          assigned_to_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          status?: string
          student_email?: string | null
          student_id?: string | null
          student_name?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          assigned_to_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          status?: string
          student_email?: string | null
          student_id?: string | null
          student_name?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      system_secrets: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          encrypted_value: string
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          encrypted_value: string
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          encrypted_value?: string
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          sender_id: string | null
          ticket_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          sender_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          sender_id?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_availability: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          start_time: string
          trainer_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          start_time: string
          trainer_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          start_time?: string
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_availability_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_documents: {
        Row: {
          id: string
          status: string | null
          title: string
          trainer_id: string | null
          uploaded_at: string | null
          url: string
        }
        Insert: {
          id?: string
          status?: string | null
          title: string
          trainer_id?: string | null
          uploaded_at?: string | null
          url: string
        }
        Update: {
          id?: string
          status?: string | null
          title?: string
          trainer_id?: string | null
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_documents_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          period_end: string | null
          period_start: string | null
          sessions_count: number | null
          status: string | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          sessions_count?: number | null
          status?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          sessions_count?: number | null
          status?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_payments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_skills: {
        Row: {
          created_at: string | null
          id: string
          proficiency: number | null
          skill_name: string
          trainer_id: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proficiency?: number | null
          skill_name: string
          trainer_id?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proficiency?: number | null
          skill_name?: string
          trainer_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_skills_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          bio: string | null
          contract_type: string | null
          created_at: string | null
          cv_url: string | null
          email: string
          experience_years: number | null
          full_name: string
          hourly_rate: number | null
          id: string
          join_date: string | null
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          specializations: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          contract_type?: string | null
          created_at?: string | null
          cv_url?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          hourly_rate?: number | null
          id?: string
          join_date?: string | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          specializations?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          contract_type?: string | null
          created_at?: string | null
          cv_url?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          join_date?: string | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          specializations?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          capacity: number | null
          course_name: string
          created_at: string | null
          end_time: string
          enrolled_count: number | null
          id: string
          location: string | null
          session_date: string
          start_time: string
          status: string | null
          trainer_id: string | null
        }
        Insert: {
          capacity?: number | null
          course_name: string
          created_at?: string | null
          end_time: string
          enrolled_count?: number | null
          id?: string
          location?: string | null
          session_date: string
          start_time: string
          status?: string | null
          trainer_id?: string | null
        }
        Update: {
          capacity?: number | null
          course_name?: string
          created_at?: string | null
          end_time?: string
          enrolled_count?: number | null
          id?: string
          location?: string | null
          session_date?: string
          start_time?: string
          status?: string | null
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          campaign_id: string | null
          category: string
          created_at: string
          created_by: string | null
          currency: string
          custom_metadata: Json | null
          date: string
          description: string | null
          id: string
          invoice_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          campaign_id?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_metadata?: Json | null
          date?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_metadata?: Json | null
          date?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          event_type: string
          id: string
          payload: Json | null
          response_body: string | null
          response_status: number | null
          status: string | null
          webhook_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          event_type: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          event_type?: string
          id?: string
          payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean | null
          name: string
          retry_count: number | null
          secret_header: string | null
          updated_at: string
          url: string
          version: string | null
        }
        Insert: {
          created_at?: string
          events: string[]
          id?: string
          is_active?: boolean | null
          name: string
          retry_count?: number | null
          secret_header?: string | null
          updated_at?: string
          url: string
          version?: string | null
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean | null
          name?: string
          retry_count?: number | null
          secret_header?: string | null
          updated_at?: string
          url?: string
          version?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      audit_summary_by_table: {
        Row: {
          deletes: number | null
          inserts: number | null
          last_change: string | null
          soft_deletes: number | null
          table_name: string | null
          total_changes: number | null
          unique_users: number | null
          updates: number | null
        }
        Relationships: []
      }
      deleted_records_report: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          deleted_by_email: string | null
          department: string | null
          id: string | null
          record_name: string | null
          table_name: string | null
        }
        Relationships: []
      }
      recent_audit_activity: {
        Row: {
          action: string | null
          count: number | null
          last_action: string | null
          table_name: string | null
          user_email: string | null
          user_role: string | null
        }
        Relationships: []
      }
      recent_errors_summary: {
        Row: {
          count: number | null
          last_occurrence: string | null
          severity: string | null
          type: string | null
        }
        Relationships: []
      }
      unread_notifications_count: {
        Row: {
          unread_count: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_summary: {
        Row: {
          last_activity: string | null
          tables_modified: number | null
          total_actions: number | null
          user_department: string | null
          user_email: string | null
          user_role: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_conflict: {
        Args: {
          p_end_time: string
          p_exclude_class_id?: string
          p_room_id: string
          p_start_time: string
          p_trainer_id: string
        }
        Returns: {
          conflict_details: string
          conflict_type: string
        }[]
      }
      get_team_member_ids: { Args: never; Returns: string[] }
      is_admin: { Args: never; Returns: boolean }
      is_department_manager: { Args: { dept: string }; Returns: boolean }
      is_senior_in_department: { Args: { dept: string }; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
