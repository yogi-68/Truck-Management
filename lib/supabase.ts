import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'clerk';
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      trucks: {
        Row: {
          id: string;
          lorry_number: string;
          model: string | null;
          capacity_kg: number | null;
          registration_date: string | null;
          insurance_expiry: string | null;
          fitness_expiry: string | null;
          status: 'active' | 'maintenance' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trucks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['trucks']['Insert']>;
      };
      drivers: {
        Row: {
          id: string;
          driver_name: string;
          license_number: string;
          phone_number: string;
          address: string | null;
          license_expiry: string | null;
          date_of_birth: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['drivers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['drivers']['Insert']>;
      };
      routes: {
        Row: {
          id: string;
          from_location: string;
          to_location: string;
          distance_km: number;
          estimated_hours: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['routes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['routes']['Insert']>;
      };
      trips: {
        Row: {
          id: string;
          trip_id: string;
          truck_id: string;
          driver_id: string;
          route_id: string;
          from_location: string;
          to_location: string;
          starting_time: string;
          ending_time: string | null;
          total_distance_km: number;
          diesel_liters: number;
          diesel_cost: number;
          toll_charges: number;
          other_expenses: number;
          driver_allowance: number;
          total_trip_expense: number;
          total_revenue: number;
          trip_profit_loss: number;
          trip_status: 'running' | 'completed';
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['trips']['Row'], 'id' | 'total_trip_expense' | 'trip_profit_loss' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['trips']['Insert']>;
      };
      gc_notes: {
        Row: {
          id: string;
          gc_number: string;
          trip_id: string;
          date_time: string;
          consignor_name: string;
          consignor_address: string;
          consignor_phone: string;
          consignor_gstin: string | null;
          consignee_name: string;
          consignee_address: string;
          consignee_phone: string;
          consignee_gstin: string | null;
          number_of_articles: number;
          description_of_goods: string;
          weight_kg: number;
          freight_rate: number;
          freight_amount: number;
          hc_charge: number;
          sc_charge: number;
          total_amount: number;
          payment_mode: 'cash' | 'upi' | 'account' | 'topay';
          payment_status: 'paid' | 'pending' | 'topay';
          delivery_option: 'office' | 'door_delivery';
          delivery_status: 'pending' | 'in_transit' | 'delivered';
          delivered_at: string | null;
          delivered_by: string | null;
          delivery_proof_image: string | null;
          qr_code_data: string | null;
          remarks: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['gc_notes']['Row'], 'id' | 'total_amount' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['gc_notes']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          gc_note_id: string;
          payment_date: string;
          amount: number;
          payment_method: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
          reference_number: string | null;
          remarks: string | null;
          received_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      expenses: {
        Row: {
          id: string;
          trip_id: string | null;
          expense_type: 'diesel' | 'toll' | 'maintenance' | 'driver_allowance' | 'other';
          amount: number;
          expense_date: string;
          description: string | null;
          receipt_image: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };
    };
  };
};
