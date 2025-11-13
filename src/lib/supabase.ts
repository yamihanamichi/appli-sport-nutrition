import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          hero_level: number;
          total_calories_consumed: number;
          total_calories_burned: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          hero_level?: number;
          total_calories_consumed?: number;
          total_calories_burned?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          hero_level?: number;
          total_calories_consumed?: number;
          total_calories_burned?: number;
          created_at?: string;
        };
      };
      foods: {
        Row: {
          id: string;
          name: string;
          calories_per_100g: number;
          proteins_per_100g: number;
          carbs_per_100g: number;
          fats_per_100g: number;
          created_at: string;
        };
      };
      activities: {
        Row: {
          id: string;
          name: string;
          calories_per_hour: number;
          category: string;
          created_at: string;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          food_id: string;
          grams: number;
          total_calories: number;
          meal_type: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          food_id: string;
          grams: number;
          total_calories: number;
          meal_type?: string;
        };
      };
      user_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_id: string;
          duration_minutes: number;
          total_calories_burned: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          activity_id: string;
          duration_minutes: number;
          total_calories_burned: number;
        };
      };
    };
  };
};
