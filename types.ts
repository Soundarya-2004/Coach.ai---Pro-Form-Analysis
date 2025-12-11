
export interface User {
  name: string;
  email: string;
  avatar: string;
  streak: number;
  lastWorkoutDate: string | null;
  totalCalories: number;
  totalHours: number;
  badges: string[];
  daily_calories_log: DailyCalorieEntry[];
  scheduled_workouts: ScheduledWorkout[];
  manual_activity_log: ManualActivity[];
  // Health Profile
  dob?: string;
  weight?: number; // in kg
  weight_history?: WeightEntry[];
  age?: number;
  initial_program?: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface DailyCalorieEntry {
  date: string;
  calories: number;
}

export interface ScheduledWorkout {
  date: string;
  time: string;
  exercise: string;
}

export interface ManualActivity {
  id: string;
  date: string;
  exercise: string;
  duration_sec: number;
  calories: number;
  intensity_level: string;
}

export interface ExerciseDetection {
  label: string;
  timestamp_range_sec: [number, number];
  confidence: number;
  score?: number; // Score out of 100
}

export interface FormFeedback {
  timestamp_range_sec: [number, number];
  issue: string;
  cue: string;
  severity: "minor" | "moderate" | "severe";
  visual_overlay_hint: string;
  body_focus: string;
}

export interface DrillRecommendation {
  name: string;
  purpose: string;
  sets: number;
  reps: number;
  rest_sec: number;
}

export interface PersonalizedPlan {
  weekly_focus: string;
  sessions_per_week: number;
  progression_rules: string;
  milestones: string[];
}

export interface SessionSummary {
  sport: string;
  exercise_type: string;
  estimated_duration_sec: number;
  intensity_level: string;
  calories_estimate: number;
  score?: number; // Overall session score out of 100
}

export interface AnalysisResponse {
  session_summary: SessionSummary;
  exercise_detection: ExerciseDetection[];
  form_feedback: FormFeedback[];
  drill_recommendations: DrillRecommendation[];
  personalized_plan: PersonalizedPlan;
}

export interface WorkoutSession {
  id: string;
  date: string;
  data: AnalysisResponse;
}

// Global definition for canvas-confetti and jspdf
declare global {
  interface Window {
    confetti: any;
    jspdf: any;
  }
}