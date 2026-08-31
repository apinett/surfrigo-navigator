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
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          created_by: string | null
          detail: string | null
          id: string
          kind: string
          resolved_at: string | null
          severity: string
          status: string
          suggested_action: string | null
          title: string
          trip_id: string | null
          unit_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          created_by?: string | null
          detail?: string | null
          id?: string
          kind: string
          resolved_at?: string | null
          severity?: string
          status?: string
          suggested_action?: string | null
          title: string
          trip_id?: string | null
          unit_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          created_by?: string | null
          detail?: string | null
          id?: string
          kind?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          suggested_action?: string | null
          title?: string
          trip_id?: string | null
          unit_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          comment: string | null
          created_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          comment?: string | null
          created_at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          comment?: string | null
          created_at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      border_crossings: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          side_ar: string | null
          side_cl: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          side_ar?: string | null
          side_cl?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          side_ar?: string | null
          side_cl?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      border_events: {
        Row: {
          border_crossing_id: string
          comment: string | null
          created_at: string
          created_by: string | null
          departed_at: string | null
          departed_from_id: string | null
          eta_border_at: string | null
          id: string
          outcome: string
          paperwork_sent_at: string | null
          recalculated_eta_at: string | null
          source: Database["public"]["Enums"]["event_source"]
          trip_id: string | null
          unit_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          border_crossing_id: string
          comment?: string | null
          created_at?: string
          created_by?: string | null
          departed_at?: string | null
          departed_from_id?: string | null
          eta_border_at?: string | null
          id?: string
          outcome?: string
          paperwork_sent_at?: string | null
          recalculated_eta_at?: string | null
          source?: Database["public"]["Enums"]["event_source"]
          trip_id?: string | null
          unit_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          border_crossing_id?: string
          comment?: string | null
          created_at?: string
          created_by?: string | null
          departed_at?: string | null
          departed_from_id?: string | null
          eta_border_at?: string | null
          id?: string
          outcome?: string
          paperwork_sent_at?: string | null
          recalculated_eta_at?: string | null
          source?: Database["public"]["Enums"]["event_source"]
          trip_id?: string | null
          unit_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "border_events_border_crossing_id_fkey"
            columns: ["border_crossing_id"]
            isOneToOne: false
            referencedRelation: "border_crossings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "border_events_departed_from_id_fkey"
            columns: ["departed_from_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "border_events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "border_events_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      border_schedules: {
        Row: {
          avg_process_minutes: number
          border_crossing_id: string
          closes_at: string
          created_at: string
          created_by: string | null
          exceptions: Json
          id: string
          opens_at: string
          paperwork_cutoff: string | null
          season: string | null
          source: string | null
          updated_at: string
          updated_by: string | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          avg_process_minutes?: number
          border_crossing_id: string
          closes_at: string
          created_at?: string
          created_by?: string | null
          exceptions?: Json
          id?: string
          opens_at: string
          paperwork_cutoff?: string | null
          season?: string | null
          source?: string | null
          updated_at?: string
          updated_by?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          avg_process_minutes?: number
          border_crossing_id?: string
          closes_at?: string
          created_at?: string
          created_by?: string | null
          exceptions?: Json
          id?: string
          opens_at?: string
          paperwork_cutoff?: string | null
          season?: string | null
          source?: string | null
          updated_at?: string
          updated_by?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "border_schedules_border_crossing_id_fkey"
            columns: ["border_crossing_id"]
            isOneToOne: false
            referencedRelation: "border_crossings"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_deliveries: {
        Row: {
          channel: string
          created_at: string
          created_by: string | null
          draft_id: string
          error_detail: string | null
          id: string
          provider: string | null
          recipient: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          channel: string
          created_at?: string
          created_by?: string | null
          draft_id: string
          error_detail?: string | null
          id?: string
          provider?: string | null
          recipient?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          created_by?: string | null
          draft_id?: string
          error_detail?: string | null
          id?: string
          provider?: string | null
          recipient?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_deliveries_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "communication_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_drafts: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string | null
          id: string
          status: string
          subject: string
          trigger: string
          trip_id: string | null
          unit_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audience: string
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          subject: string
          trigger: string
          trip_id?: string | null
          unit_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          status?: string
          subject?: string
          trigger?: string
          trip_id?: string | null
          unit_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_drafts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_drafts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_requests: {
        Row: {
          cargo: string | null
          created_at: string
          created_by: string | null
          day_index: number
          destination_id: string | null
          destination_label: string
          id: string
          is_cancelled: boolean
          km: number | null
          notes: string | null
          operational_date: string
          plan_id: string
          priority: number | null
          route_exact: boolean | null
          route_id: string | null
          route_label: string | null
          route_stops: string[]
          source: string
          suggested_departure_time: string
          target_unload_at: string | null
          units_required: number
          updated_at: string
          updated_by: string | null
          window_end_time: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          created_by?: string | null
          day_index: number
          destination_id?: string | null
          destination_label: string
          id?: string
          is_cancelled?: boolean
          km?: number | null
          notes?: string | null
          operational_date: string
          plan_id: string
          priority?: number | null
          route_exact?: boolean | null
          route_id?: string | null
          route_label?: string | null
          route_stops?: string[]
          source?: string
          suggested_departure_time?: string
          target_unload_at?: string | null
          units_required?: number
          updated_at?: string
          updated_by?: string | null
          window_end_time?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          created_by?: string | null
          day_index?: number
          destination_id?: string | null
          destination_label?: string
          id?: string
          is_cancelled?: boolean
          km?: number | null
          notes?: string | null
          operational_date?: string
          plan_id?: string
          priority?: number | null
          route_exact?: boolean | null
          route_id?: string | null
          route_label?: string | null
          route_stops?: string[]
          source?: string
          suggested_departure_time?: string
          target_unload_at?: string | null
          units_required?: number
          updated_at?: string
          updated_by?: string | null
          window_end_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposit_requests_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_requests_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          departure_at: string
          driver_id: string | null
          eta_at: string | null
          id: string
          is_active: boolean
          margin_minutes: number | null
          recommendation_outcome: string | null
          removed_at: string | null
          request_id: string
          risk: Database["public"]["Enums"]["risk_level"] | null
          score: number | null
          score_breakdown: Json
          unit_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          departure_at: string
          driver_id?: string | null
          eta_at?: string | null
          id?: string
          is_active?: boolean
          margin_minutes?: number | null
          recommendation_outcome?: string | null
          removed_at?: string | null
          request_id: string
          risk?: Database["public"]["Enums"]["risk_level"] | null
          score?: number | null
          score_breakdown?: Json
          unit_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          departure_at?: string
          driver_id?: string | null
          eta_at?: string | null
          id?: string
          is_active?: boolean
          margin_minutes?: number | null
          recommendation_outcome?: string | null
          removed_at?: string | null
          request_id?: string
          risk?: Database["public"]["Enums"]["risk_level"] | null
          score?: number | null
          score_breakdown?: Json
          unit_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "deposit_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_assignments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          border_event_id: string | null
          created_at: string
          created_by: string | null
          doc_kind: string
          driver_id: string | null
          file_name: string
          id: string
          maintenance_order_id: string | null
          mime_type: string | null
          notes: string | null
          size_bytes: number | null
          storage_path: string
          trip_id: string | null
          unit_id: string | null
        }
        Insert: {
          border_event_id?: string | null
          created_at?: string
          created_by?: string | null
          doc_kind: string
          driver_id?: string | null
          file_name: string
          id?: string
          maintenance_order_id?: string | null
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          storage_path: string
          trip_id?: string | null
          unit_id?: string | null
        }
        Update: {
          border_event_id?: string | null
          created_at?: string
          created_by?: string | null
          doc_kind?: string
          driver_id?: string | null
          file_name?: string
          id?: string
          maintenance_order_id?: string | null
          mime_type?: string | null
          notes?: string | null
          size_bytes?: number | null
          storage_path?: string
          trip_id?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_border_event_id_fkey"
            columns: ["border_event_id"]
            isOneToOne: false
            referencedRelation: "border_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_maintenance_order_id_fkey"
            columns: ["maintenance_order_id"]
            isOneToOne: false
            referencedRelation: "maintenance_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          created_at: string
          created_by: string | null
          doc_type: string
          driver_id: string
          expires_at: string | null
          id: string
          issued_at: string | null
          number: string | null
          status: string
          storage_path: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          doc_type: string
          driver_id: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          doc_type?: string
          driver_id?: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          code: string | null
          created_at: string
          created_by: string | null
          driver_role: string
          full_name: string
          home_city: string | null
          id: string
          is_active: boolean
          km_period: number
          km_target: number
          last_destination_id: string | null
          notes: string | null
          phone: string | null
          province: string | null
          rest_days_available: number
          updated_at: string
          updated_by: string | null
          work_status: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          driver_role?: string
          full_name: string
          home_city?: string | null
          id?: string
          is_active?: boolean
          km_period?: number
          km_target?: number
          last_destination_id?: string | null
          notes?: string | null
          phone?: string | null
          province?: string | null
          rest_days_available?: number
          updated_at?: string
          updated_by?: string | null
          work_status?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          driver_role?: string
          full_name?: string
          home_city?: string | null
          id?: string
          is_active?: boolean
          km_period?: number
          km_target?: number
          last_destination_id?: string | null
          notes?: string | null
          phone?: string | null
          province?: string | null
          rest_days_available?: number
          updated_at?: string
          updated_by?: string | null
          work_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_last_destination_id_fkey"
            columns: ["last_destination_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_entries: {
        Row: {
          cost: number | null
          created_at: string
          created_by: string | null
          currency: string
          document_id: string | null
          filled_at: string
          id: string
          liters: number
          location_id: string | null
          odometer_km: number | null
          supplier: string | null
          unit_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          document_id?: string | null
          filled_at: string
          id?: string
          liters: number
          location_id?: string | null
          odometer_km?: number | null
          supplier?: string | null
          unit_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string
          document_id?: string | null
          filled_at?: string
          id?: string
          liters?: number
          location_id?: string | null
          odometer_km?: number | null
          supplier?: string | null
          unit_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_entries_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_entries_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_entries_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      geofence_events: {
        Row: {
          event_type: string
          id: number
          location_id: string | null
          occurred_at: string
          received_at: string
          source: Database["public"]["Enums"]["event_source"]
          unit_id: string | null
        }
        Insert: {
          event_type: string
          id?: number
          location_id?: string | null
          occurred_at: string
          received_at?: string
          source?: Database["public"]["Enums"]["event_source"]
          unit_id?: string | null
        }
        Update: {
          event_type?: string
          id?: number
          location_id?: string | null
          occurred_at?: string
          received_at?: string
          source?: Database["public"]["Enums"]["event_source"]
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geofence_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_events_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          code: string
          country: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          kind: string
          km_from_ezeiza: number | null
          name: string
          province: string | null
          transit_hours: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          country: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          kind: string
          km_from_ezeiza?: number | null
          name: string
          province?: string | null
          transit_hours?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          country?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          km_from_ezeiza?: number | null
          name?: string
          province?: string | null
          transit_hours?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      maintenance_orders: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          location_id: string | null
          opened_at: string
          order_type: string
          scheduled_at: string | null
          status: string
          tractor_id: string | null
          trailer_id: string | null
          unit_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          location_id?: string | null
          opened_at?: string
          order_type?: string
          scheduled_at?: string | null
          status?: string
          tractor_id?: string | null
          trailer_id?: string | null
          unit_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          location_id?: string | null
          opened_at?: string
          order_type?: string
          scheduled_at?: string | null
          status?: string
          tractor_id?: string | null
          trailer_id?: string | null
          unit_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_orders_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "tractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_orders_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_orders_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_versions: {
        Row: {
          comment: string | null
          created_at: string
          created_by: string | null
          id: string
          plan_id: string
          snapshot: Json
          status: Database["public"]["Enums"]["plan_status"]
          version: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          plan_id: string
          snapshot?: Json
          status: Database["public"]["Enums"]["plan_status"]
          version: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          plan_id?: string
          snapshot?: Json
          status?: Database["public"]["Enums"]["plan_status"]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_versions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          alias: string[]
          id: string
          location_id: string | null
          normalized_name: string
          position: number
          route_id: string
          stop_name: string
        }
        Insert: {
          alias?: string[]
          id?: string
          location_id?: string | null
          normalized_name: string
          position: number
          route_id: string
          stop_name: string
        }
        Update: {
          alias?: string[]
          id?: string
          location_id?: string | null
          normalized_name?: string
          position?: number
          route_id?: string
          stop_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_exact: boolean
          label: string
          normalized_label: string
          source: string
          total_km: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_exact?: boolean
          label: string
          normalized_label: string
          source?: string
          total_km?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_exact?: boolean
          label?: string
          normalized_label?: string
          source?: string
          total_km?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tracking_devices: {
        Row: {
          connection_status: string
          created_at: string
          external_id: string
          id: string
          last_seen_at: string | null
          provider_id: string
          tractor_id: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          connection_status?: string
          created_at?: string
          external_id: string
          id?: string
          last_seen_at?: string | null
          provider_id: string
          tractor_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          connection_status?: string
          created_at?: string
          external_id?: string
          id?: string
          last_seen_at?: string | null
          provider_id?: string
          tractor_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_devices_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "tracking_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_devices_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "tractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_devices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_providers: {
        Row: {
          code: string
          config: Json
          created_at: string
          created_by: string | null
          id: string
          is_configured: boolean
          kind: string
          last_sync_at: string | null
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_configured?: boolean
          kind?: string
          last_sync_at?: string | null
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_configured?: boolean
          kind?: string
          last_sync_at?: string | null
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tractors: {
        Row: {
          brand: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          model: string | null
          notes: string | null
          odometer_km: number
          plate: string
          status: Database["public"]["Enums"]["operation_status"]
          updated_at: string
          updated_by: string | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          notes?: string | null
          odometer_km?: number
          plate: string
          status?: Database["public"]["Enums"]["operation_status"]
          updated_at?: string
          updated_by?: string | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          notes?: string | null
          odometer_km?: number
          plate?: string
          status?: Database["public"]["Enums"]["operation_status"]
          updated_at?: string
          updated_by?: string | null
          year?: number | null
        }
        Relationships: []
      }
      trailers: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_reefer: boolean
          notes: string | null
          pallet_capacity: number | null
          plate: string
          trailer_type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_reefer?: boolean
          notes?: string | null
          pallet_capacity?: number | null
          plate: string
          trailer_type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_reefer?: boolean
          notes?: string | null
          pallet_capacity?: number | null
          plate?: string
          trailer_type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      trip_events: {
        Row: {
          actor_id: string | null
          comment: string | null
          document_id: string | null
          id: string
          location_id: string | null
          new_status: Database["public"]["Enums"]["trip_status"]
          operational_at: string
          previous_status: Database["public"]["Enums"]["trip_status"] | null
          recorded_at: string
          source: Database["public"]["Enums"]["event_source"]
          trip_id: string
          unit_id: string | null
        }
        Insert: {
          actor_id?: string | null
          comment?: string | null
          document_id?: string | null
          id?: string
          location_id?: string | null
          new_status: Database["public"]["Enums"]["trip_status"]
          operational_at?: string
          previous_status?: Database["public"]["Enums"]["trip_status"] | null
          recorded_at?: string
          source?: Database["public"]["Enums"]["event_source"]
          trip_id: string
          unit_id?: string | null
        }
        Update: {
          actor_id?: string | null
          comment?: string | null
          document_id?: string | null
          id?: string
          location_id?: string | null
          new_status?: Database["public"]["Enums"]["trip_status"]
          operational_at?: string
          previous_status?: Database["public"]["Enums"]["trip_status"] | null
          recorded_at?: string
          source?: Database["public"]["Enums"]["event_source"]
          trip_id?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_events_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          assignment_id: string | null
          border_crossing_id: string | null
          cargo: string | null
          code: string | null
          created_at: string
          created_by: string | null
          departure_at: string | null
          destination_id: string | null
          documentation_ready: boolean
          driver_id: string | null
          eta_at: string | null
          eta_calculated_at: string | null
          eta_confidence: string | null
          eta_kind: string
          id: string
          is_cancelled: boolean
          km: number | null
          margin_minutes: number | null
          origin_id: string | null
          risk: Database["public"]["Enums"]["risk_level"] | null
          route_id: string | null
          status: Database["public"]["Enums"]["trip_status"]
          target_unload_at: string | null
          unit_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignment_id?: string | null
          border_crossing_id?: string | null
          cargo?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          departure_at?: string | null
          destination_id?: string | null
          documentation_ready?: boolean
          driver_id?: string | null
          eta_at?: string | null
          eta_calculated_at?: string | null
          eta_confidence?: string | null
          eta_kind?: string
          id?: string
          is_cancelled?: boolean
          km?: number | null
          margin_minutes?: number | null
          origin_id?: string | null
          risk?: Database["public"]["Enums"]["risk_level"] | null
          route_id?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          target_unload_at?: string | null
          unit_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignment_id?: string | null
          border_crossing_id?: string | null
          cargo?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          departure_at?: string | null
          destination_id?: string | null
          documentation_ready?: boolean
          driver_id?: string | null
          eta_at?: string | null
          eta_calculated_at?: string | null
          eta_confidence?: string | null
          eta_kind?: string
          id?: string
          is_cancelled?: boolean
          km?: number | null
          margin_minutes?: number | null
          origin_id?: string | null
          risk?: Database["public"]["Enums"]["risk_level"] | null
          route_id?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          target_unload_at?: string | null
          unit_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "dispatch_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_border_crossing_id_fkey"
            columns: ["border_crossing_id"]
            isOneToOne: false
            referencedRelation: "border_crossings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_driver_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          driver_id: string
          driver_role: string
          id: string
          unit_id: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          driver_id: string
          driver_role?: string
          id?: string
          unit_id: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          driver_id?: string
          driver_role?: string
          id?: string
          unit_id?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_driver_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_driver_assignments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_status_events: {
        Row: {
          actor_id: string | null
          comment: string | null
          id: string
          location_id: string | null
          new_status: Database["public"]["Enums"]["operation_status"]
          operational_at: string
          previous_status:
            | Database["public"]["Enums"]["operation_status"]
            | null
          recorded_at: string
          source: Database["public"]["Enums"]["event_source"]
          unit_id: string
        }
        Insert: {
          actor_id?: string | null
          comment?: string | null
          id?: string
          location_id?: string | null
          new_status: Database["public"]["Enums"]["operation_status"]
          operational_at?: string
          previous_status?:
            | Database["public"]["Enums"]["operation_status"]
            | null
          recorded_at?: string
          source?: Database["public"]["Enums"]["event_source"]
          unit_id: string
        }
        Update: {
          actor_id?: string | null
          comment?: string | null
          id?: string
          location_id?: string | null
          new_status?: Database["public"]["Enums"]["operation_status"]
          operational_at?: string
          previous_status?:
            | Database["public"]["Enums"]["operation_status"]
            | null
          recorded_at?: string
          source?: Database["public"]["Enums"]["event_source"]
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_status_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_status_events_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_trailer_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          trailer_id: string
          unit_id: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          trailer_id: string
          unit_id: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          trailer_id?: string
          unit_id?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_trailer_assignments_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_trailer_assignments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          available_at: string | null
          code: string
          created_at: string
          created_by: string | null
          current_location_id: string | null
          driver_id: string | null
          id: string
          is_active: boolean
          km_period: number
          km_target: number
          last_destination_id: string | null
          notes: string | null
          relief_driver_id: string | null
          status: Database["public"]["Enums"]["operation_status"]
          tractor_id: string | null
          trailer_id: string | null
          updated_at: string
          updated_by: string | null
          workshop_due: boolean
        }
        Insert: {
          available_at?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          current_location_id?: string | null
          driver_id?: string | null
          id?: string
          is_active?: boolean
          km_period?: number
          km_target?: number
          last_destination_id?: string | null
          notes?: string | null
          relief_driver_id?: string | null
          status?: Database["public"]["Enums"]["operation_status"]
          tractor_id?: string | null
          trailer_id?: string | null
          updated_at?: string
          updated_by?: string | null
          workshop_due?: boolean
        }
        Update: {
          available_at?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          current_location_id?: string | null
          driver_id?: string | null
          id?: string
          is_active?: boolean
          km_period?: number
          km_target?: number
          last_destination_id?: string | null
          notes?: string | null
          relief_driver_id?: string | null
          status?: Database["public"]["Enums"]["operation_status"]
          tractor_id?: string | null
          trailer_id?: string | null
          updated_at?: string
          updated_by?: string | null
          workshop_due?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "units_current_location_id_fkey"
            columns: ["current_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_last_destination_id_fkey"
            columns: ["last_destination_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_relief_driver_id_fkey"
            columns: ["relief_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "tractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_documents: {
        Row: {
          created_at: string
          created_by: string | null
          doc_type: string
          expires_at: string | null
          id: string
          issued_at: string | null
          number: string | null
          status: string
          storage_path: string | null
          tractor_id: string | null
          trailer_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          doc_type: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          status?: string
          storage_path?: string | null
          tractor_id?: string | null
          trailer_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          doc_type?: string
          expires_at?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          status?: string
          storage_path?: string | null
          tractor_id?: string | null
          trailer_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_tractor_id_fkey"
            columns: ["tractor_id"]
            isOneToOne: false
            referencedRelation: "tractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_positions: {
        Row: {
          device_id: string | null
          heading: number | null
          id: number
          is_stale: boolean
          latitude: number
          longitude: number
          raw: Json | null
          received_at: string
          recorded_at: string
          speed_kmh: number | null
          temperature_c: number | null
          unit_id: string | null
        }
        Insert: {
          device_id?: string | null
          heading?: number | null
          id?: number
          is_stale?: boolean
          latitude: number
          longitude: number
          raw?: Json | null
          received_at?: string
          recorded_at: string
          speed_kmh?: number | null
          temperature_c?: number | null
          unit_id?: string | null
        }
        Update: {
          device_id?: string | null
          heading?: number | null
          id?: number
          is_stale?: boolean
          latitude?: number
          longitude?: number
          raw?: Json | null
          received_at?: string
          recorded_at?: string
          speed_kmh?: number | null
          temperature_c?: number | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_positions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "tracking_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_positions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_plans: {
        Row: {
          created_at: string
          created_by: string | null
          current_version: number
          id: string
          label: string | null
          published_at: string | null
          published_by: string | null
          status: Database["public"]["Enums"]["plan_status"]
          updated_at: string
          updated_by: string | null
          week_start: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_version?: number
          id?: string
          label?: string | null
          published_at?: string | null
          published_by?: string | null
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
          updated_by?: string | null
          week_start: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_version?: number
          id?: string
          label?: string | null
          published_at?: string | null
          published_by?: string | null
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
          updated_by?: string | null
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_member: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "analista" | "seguimiento" | "taller" | "consulta"
      event_source: "manual" | "integracion" | "sistema"
      operation_status:
        | "disponible"
        | "programada"
        | "cargando"
        | "transito"
        | "descargando"
        | "retorno_chile"
        | "frontera"
        | "taller"
        | "riesgo"
        | "demorada"
        | "cancelada"
      plan_status: "borrador" | "publicado" | "cerrado" | "cancelado"
      risk_level: "bajo" | "medio" | "alto"
      trip_status:
        | "programado"
        | "confirmado"
        | "cargando"
        | "salio_origen"
        | "transito"
        | "llego_destino"
        | "descargando"
        | "descargado"
        | "disponible"
        | "retorno"
        | "frontera"
        | "taller"
        | "finalizado"
        | "cancelado"
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
    Enums: {
      app_role: ["admin", "analista", "seguimiento", "taller", "consulta"],
      event_source: ["manual", "integracion", "sistema"],
      operation_status: [
        "disponible",
        "programada",
        "cargando",
        "transito",
        "descargando",
        "retorno_chile",
        "frontera",
        "taller",
        "riesgo",
        "demorada",
        "cancelada",
      ],
      plan_status: ["borrador", "publicado", "cerrado", "cancelado"],
      risk_level: ["bajo", "medio", "alto"],
      trip_status: [
        "programado",
        "confirmado",
        "cargando",
        "salio_origen",
        "transito",
        "llego_destino",
        "descargando",
        "descargado",
        "disponible",
        "retorno",
        "frontera",
        "taller",
        "finalizado",
        "cancelado",
      ],
    },
  },
} as const
