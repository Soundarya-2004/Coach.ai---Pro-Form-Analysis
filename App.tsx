
import React, { useState, useEffect } from 'react';
import { User, WorkoutSession, AnalysisResponse, ScheduledWorkout, ManualActivity } from './types';
import { updateUser, getUserSessions, saveUserSession, incrementStreak, calculateStreak, generateInitialProgram } from './services/storage';
import { analyzeVideo } from './services/geminiService';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
import { VideoUpload } from './components/VideoUpload';
import { AnalysisResultView } from './components/AnalysisResultView';
import { ScheduleModal } from './components/ScheduleModal';
import { ManualLogModal } from './components/ManualLogModal';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);
  const [viewingSession, setViewingSession] = useState<WorkoutSession | null>(null);
  
  // New Modals State
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoggingManual, setIsLoggingManual] = useState(false);

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogin = (loggedInUser: User) => {
    // On login, we calculate if the streak is still valid based on the last workout date found in DB
    const currentStreak = calculateStreak(loggedInUser.lastWorkoutDate, loggedInUser.streak);
    
    const updatedUser = { ...loggedInUser, streak: currentStreak };
    
    // Save the streak update if it changed
    if (currentStreak !== loggedInUser.streak) {
       updateUser(updatedUser);
    }
    
    setUser(updatedUser);
    setSessions(getUserSessions(updatedUser.email));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentAnalysis(null);
    setSessions([]);
  };

  const handleWeightUpdate = (weight: number) => {
    if (!user) return;
    
    // Create new history entry
    const todayStr = new Date().toISOString().split('T')[0];
    let newHistory = [...(user.weight_history || [])];
    
    // Update existing entry for today or add new one
    const existingIndex = newHistory.findIndex(h => h.date === todayStr);
    if (existingIndex >= 0) {
      newHistory[existingIndex].weight = weight;
    } else {
      newHistory.push({ date: todayStr, weight });
    }
    newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Update program if needed
    const newProgram = generateInitialProgram(user.age || 25, weight);

    const updatedUser = { 
      ...user, 
      weight, 
      weight_history: newHistory,
      initial_program: newProgram
    };
    
    setUser(updatedUser);
    updateUser(updatedUser);
  };

  const handleVideoSelect = async (file: File) => {
    if (!user) return;
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeVideo(file);
      
      const newSession: WorkoutSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        data: result
      };

      // Calculate new stats
      const newTotalCalories = user.totalCalories + result.session_summary.calories_estimate;
      const newTotalHours = user.totalHours + (result.session_summary.estimated_duration_sec / 3600);
      const newLastDate = new Date().toISOString();
      const newStreak = incrementStreak(user.lastWorkoutDate, user.streak);
      
      // Update Daily Calories Log
      const todayStr = new Date().toISOString().split('T')[0];
      let newCalorieLog = [...(user.daily_calories_log || [])];
      const existingEntryIndex = newCalorieLog.findIndex(e => e.date === todayStr);

      if (existingEntryIndex >= 0) {
        newCalorieLog[existingEntryIndex].calories += result.session_summary.calories_estimate;
      } else {
        newCalorieLog.push({
          date: todayStr,
          calories: result.session_summary.calories_estimate
        });
      }
      newCalorieLog.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Check for badges
      let newBadges = [...user.badges];
      if (newStreak >= 5 && !newBadges.includes("🔥 5-Day Streak")) newBadges.push("🔥 5-Day Streak");
      const hasSevereIssues = result.form_feedback.some(f => f.severity === 'severe');
      if (!hasSevereIssues && result.form_feedback.length > 0 && !newBadges.includes("🎯 Precision Pro")) {
          newBadges.push("🎯 Precision Pro");
      }
      if (newTotalCalories > 5000 && !newBadges.includes("⚡ 5k Club")) newBadges.push("⚡ 5k Club");

      const updatedUser: User = {
        ...user,
        totalCalories: newTotalCalories,
        totalHours: newTotalHours,
        lastWorkoutDate: newLastDate,
        streak: newStreak,
        badges: newBadges,
        daily_calories_log: newCalorieLog
      };

      // Persist to DB
      updateUser(updatedUser);
      saveUserSession(user.email, newSession);
      
      // Update State
      setUser(updatedUser);
      setSessions(prev => [newSession, ...prev]);

      setCurrentAnalysis(result);
      setIsUploading(false); 
    } catch (error) {
      alert("Analysis failed. Please try again or check your API key.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveScheduledWorkout = (workout: ScheduledWorkout) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      scheduled_workouts: [...(user.scheduled_workouts || []), workout]
    };
    setUser(updatedUser);
    updateUser(updatedUser);
  };

  const handleSaveManualActivity = (activity: ManualActivity) => {
    if (!user) return;

    const newTotalCalories = user.totalCalories + activity.calories;
    const newTotalHours = user.totalHours + (activity.duration_sec / 3600);
    const newLastDate = new Date().toISOString(); 
    const newStreak = incrementStreak(user.lastWorkoutDate, user.streak);

    // Update Daily Log
    let newCalorieLog = [...(user.daily_calories_log || [])];
    const existingEntryIndex = newCalorieLog.findIndex(e => e.date === activity.date);
    if (existingEntryIndex >= 0) {
      newCalorieLog[existingEntryIndex].calories += activity.calories;
    } else {
      newCalorieLog.push({
        date: activity.date,
        calories: activity.calories
      });
    }
    newCalorieLog.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const updatedUser = {
      ...user,
      manual_activity_log: [...(user.manual_activity_log || []), activity],
      daily_calories_log: newCalorieLog,
      totalCalories: newTotalCalories,
      totalHours: newTotalHours,
      lastWorkoutDate: newLastDate,
      streak: newStreak
    };

    setUser(updatedUser);
    updateUser(updatedUser);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout userImage={user.avatar} onLogout={handleLogout} darkMode={darkMode} toggleTheme={toggleTheme}>
      {/* Upload Modal */}
      {isUploading && (
        <VideoUpload 
          onFileSelect={handleVideoSelect} 
          onCancel={() => setIsUploading(false)} 
          isAnalyzing={isAnalyzing}
        />
      )}

      {/* Schedule Modal */}
      {isScheduling && (
        <ScheduleModal 
          onSave={handleSaveScheduledWorkout} 
          onClose={() => setIsScheduling(false)} 
        />
      )}

      {/* Manual Log Modal */}
      {isLoggingManual && (
        <ManualLogModal 
          logs={user.manual_activity_log || []} 
          onSave={handleSaveManualActivity} 
          onClose={() => setIsLoggingManual(false)} 
        />
      )}

      {currentAnalysis ? (
        <AnalysisResultView 
          data={currentAnalysis} 
          onBack={() => setCurrentAnalysis(null)}
          isHistorical={false} 
        />
      ) : viewingSession ? (
        <AnalysisResultView 
          data={viewingSession.data} 
          onBack={() => setViewingSession(null)}
          date={viewingSession.date}
          isHistorical={true}
        />
      ) : (
        <Dashboard 
          user={user} 
          sessions={sessions} 
          onUploadClick={() => setIsUploading(true)}
          onViewSession={setViewingSession}
          onScheduleClick={() => setIsScheduling(true)}
          onManualLogClick={() => setIsLoggingManual(true)}
          onUpdateWeight={handleWeightUpdate}
          isDarkMode={darkMode}
        />
      )}
    </Layout>
  );
}

export default App;
