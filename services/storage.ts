import { User, WorkoutSession, WeightEntry } from "../types";

const STORAGE_USER_KEY = "coach_ai_local_user_v1";
const STORAGE_SESSIONS_KEY = "coach_ai_local_sessions_v1";

// --- Helpers ---

export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const generateInitialProgram = (age: number, weight: number): string => {
  if (age > 60) return "Mobility & Joint Health Fundamentals";
  if (age < 18) return "Youth Athletic Foundation";
  if (weight > 100) return "Low Impact Conditioning & Stability";
  if (age > 40) return "Functional Strength & Recovery";
  return "High Performance Conditioning";
};

// --- Local Data Management ---

export const getLocalUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveLocalUser = (user: User) => {
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
};

export const getLocalSessions = (): WorkoutSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveLocalSession = (session: WorkoutSession) => {
  const sessions = getLocalSessions();
  const newSessions = [session, ...sessions];
  localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(newSessions));
};

export const clearLocalData = async () => {
  try {
    console.log("Executing Factory Reset...");

    // 1. Clear standard web storage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Clear Caches API (Service Workers, PWA caches)
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }

    // 3. Clear IndexedDB Databases
    // Note: window.indexedDB.databases() is not supported in all browsers (e.g. standard Firefox), 
    // so we wrap it safely.
    if (window.indexedDB && typeof window.indexedDB.databases === 'function') {
      const dbs = await window.indexedDB.databases();
      await Promise.all(dbs.map(db => 
        db.name ? new Promise<void>((resolve, reject) => {
          const request = window.indexedDB.deleteDatabase(db.name!);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve(); // Resolve anyway to continue
          request.onblocked = () => resolve();
        }) : Promise.resolve()
      ));
    }

    console.log("Storage wiped successfully.");
  } catch (error) {
    console.error("Error during storage reset:", error);
    // Fallback sync clear
    localStorage.clear();
    sessionStorage.clear();
  }
};

export const initializeDefaultUser = (): User => {
  const existing = getLocalUser();
  if (existing) return existing;

  const defaultWeight = 75;
  const dob = "1995-01-01";
  const age = calculateAge(dob);
  
  const newUser: User = {
    name: "Guest Athlete",
    email: "local@device", // Dummy identifier
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Athlete`,
    streak: 0,
    lastWorkoutDate: null,
    totalCalories: 0,
    totalHours: 0,
    badges: [],
    daily_calories_log: [],
    scheduled_workouts: [],
    manual_activity_log: [],
    dob: dob,
    weight: defaultWeight,
    weight_history: [{
      date: new Date().toISOString().split('T')[0],
      weight: defaultWeight
    }],
    age: age,
    initial_program: generateInitialProgram(age, defaultWeight)
  };

  saveLocalUser(newUser);
  return newUser;
};

// --- Streak Logic (Pure Functions) ---

export const calculateStreak = (lastDate: string | null, currentStreak: number): number => {
  if (!lastDate) return 0; // If no last date, streak is 0 unless updated today
  
  const today = new Date().toDateString();
  const last = new Date(lastDate).toDateString();
  
  // If last workout was today, streak is maintained
  if (today === last) return currentStreak;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If last workout was yesterday, streak is maintained (and will increment on next workout)
  if (yesterday.toDateString() === last) {
    return currentStreak;
  }
  
  // If older than yesterday, streak is broken
  return 0; 
};

export const incrementStreak = (lastDate: string | null, currentStreak: number): number => {
  const today = new Date().toDateString();
  
  // First workout ever
  if (!lastDate) return 1;

  const last = new Date(lastDate).toDateString();
  
  // Already worked out today?
  if (today === last) return currentStreak;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Worked out yesterday?
  if (yesterday.toDateString() === last) {
    return currentStreak + 1;
  }
  
  // Streak broken, restart
  return 1;
};