
import { User, WorkoutSession, WeightEntry } from "../types";

const DB_USERS_KEY = "coach_ai_users_db";
const DB_SESSIONS_KEY = "coach_ai_sessions_db";

interface UserDB {
  [email: string]: User & { password?: string };
}

interface SessionDB {
  [email: string]: WorkoutSession[];
}

// --- Helpers ---

const getUsersDB = (): UserDB => {
  try {
    return JSON.parse(localStorage.getItem(DB_USERS_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveUsersDB = (db: UserDB) => {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(db));
};

const getSessionsDB = (): SessionDB => {
  try {
    return JSON.parse(localStorage.getItem(DB_SESSIONS_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveSessionsDB = (db: SessionDB) => {
  localStorage.setItem(DB_SESSIONS_KEY, JSON.stringify(db));
};

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

// --- Auth & User Management ---

export const checkUserExists = (email: string): boolean => {
  const db = getUsersDB();
  return !!db[email];
};

export const verifyCredentials = (email: string, password: string): User | null => {
  const db = getUsersDB();
  const user = db[email];
  if (user && user.password === password) {
    // Return user without password field to frontend
    const { password: _, ...safeUser } = user;
    return safeUser as User;
  }
  return null;
};

export const createAccount = (
  email: string, 
  password: string, 
  name: string, 
  avatar: string,
  dob?: string,
  weight?: number
): User => {
  const db = getUsersDB();
  
  // Logic for defaults if not provided (e.g. Google Auth mock)
  const finalDob = dob || "1990-01-01";
  const finalWeight = weight || 75;
  const age = calculateAge(finalDob);
  const initialProgram = generateInitialProgram(age, finalWeight);
  
  const weightHistory: WeightEntry[] = [{
    date: new Date().toISOString().split('T')[0],
    weight: finalWeight
  }];

  const newUser: User & { password: string } = {
    name,
    email,
    avatar,
    streak: 0,
    lastWorkoutDate: null,
    totalCalories: 0,
    totalHours: 0,
    badges: [],
    daily_calories_log: [],
    scheduled_workouts: [],
    manual_activity_log: [],
    dob: finalDob,
    weight: finalWeight,
    weight_history: weightHistory,
    age: age,
    initial_program: initialProgram,
    password // Storing strictly for this demo's auth requirement
  };

  db[email] = newUser;
  saveUsersDB(db);

  const { password: _, ...safeUser } = newUser;
  return safeUser as User;
};

export const updateUser = (user: User) => {
  const db = getUsersDB();
  const existing = db[user.email];
  
  if (existing) {
    db[user.email] = { ...existing, ...user };
    saveUsersDB(db);
  }
};

// --- Session Management ---

export const getUserSessions = (email: string): WorkoutSession[] => {
  const db = getSessionsDB();
  return db[email] || [];
};

export const saveUserSession = (email: string, session: WorkoutSession) => {
  const db = getSessionsDB();
  const userSessions = db[email] || [];
  
  // Prepend new session
  db[email] = [session, ...userSessions];
  saveSessionsDB(db);
};

// --- Utilities ---

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
