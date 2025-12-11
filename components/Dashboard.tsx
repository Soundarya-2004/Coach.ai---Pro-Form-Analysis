
import React, { useState, useEffect, useRef } from 'react';
import { User, WorkoutSession } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { Flame, Clock, Trophy, ArrowRight, Activity, Calendar, UploadCloud, TrendingUp, Target, Star, Scale, Edit2, Check, X, History, Download } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, LineChart, Line } from 'recharts';
import { CoachAvatar } from './CoachAvatar';
import { exportProfileData } from '../services/pdfExport';

interface DashboardProps {
  user: User;
  sessions: WorkoutSession[];
  onUploadClick: () => void;
  onViewSession: (session: WorkoutSession) => void;
  onScheduleClick: () => void;
  onManualLogClick: () => void;
  onUpdateWeight: (weight: number) => void;
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  sessions, 
  onUploadClick, 
  onViewSession,
  onScheduleClick,
  onManualLogClick,
  onUpdateWeight,
  isDarkMode
}) => {
  
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [showWeightHistory, setShowWeightHistory] = useState(false);
  const weightInputRef = useRef<HTMLInputElement>(null);

  const handleSaveWeight = () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0 && val !== user.weight) {
      onUpdateWeight(val);
    }
    setIsEditingWeight(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveWeight();
    } else if (e.key === 'Escape') {
      setIsEditingWeight(false);
      setWeightInput(user.weight?.toString() || '');
    }
  };

  useEffect(() => {
    if (isEditingWeight && weightInputRef.current) {
      weightInputRef.current.focus();
    }
  }, [isEditingWeight]);

  // Use aggregated daily logs for the chart to show cumulative progress
  const chartData = (user.daily_calories_log || []).slice(-7).map(entry => ({
    name: new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short' }),
    calories: entry.calories,
    date: entry.date
  }));

  // Fill empty chart if no data
  if (chartData.length === 0) {
    chartData.push({ name: 'Mon', calories: 0, date: '' }, { name: 'Tue', calories: 0, date: '' }, { name: 'Wed', calories: 0, date: '' });
  }

  // Weight History Data
  const weightHistoryData = (user.weight_history || [])
    .slice(-10) // Show last 10 entries
    .map(w => ({
      date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: w.weight
    }));

  // Filter for future scheduled workouts
  const upcomingWorkouts = (user.scheduled_workouts || [])
    .filter(w => new Date(w.date + 'T' + w.time) >= new Date())
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

  // Streak Visual Logic
  const visualStreakGoal = 7;
  const [visualStreak, setVisualStreak] = useState(0);
  
  // Staggered animation effect for streak bar
  useEffect(() => {
    const target = Math.min(user.streak, visualStreakGoal);
    
    if (visualStreak < target) {
      const timer = setTimeout(() => {
        setVisualStreak(prev => prev + 1);
      }, 150); // 150ms delay between blocks filling up
      return () => clearTimeout(timer);
    } else if (visualStreak > target) {
      // If streak drops (e.g. broken streak), update immediately
      setVisualStreak(target);
    }
  }, [user.streak, visualStreak]);
  
  const chartStrokeColor = isDarkMode ? "#ffffff" : "#000000";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Streak */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black dark:border-white pb-6 transition-colors duration-300">
        <div>
          <h1 className="text-4xl font-extrabold mb-1 tracking-tight dark:text-white">DASHBOARD</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Welcome back, {user.name.split(' ')[0]}.</p>
        </div>
        
        {/* Streak Visualizer */}
        <div className="flex flex-col items-end gap-2">
           <div className="flex items-center gap-1" title="7-Day Consistency Goal">
              {[...Array(visualStreakGoal)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-3 w-6 md:w-8 -skew-x-12 border border-black dark:border-white transition-all duration-300 ${
                    i < visualStreak 
                      ? 'bg-black dark:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] scale-110' 
                      : 'bg-transparent opacity-20 dark:opacity-40 scale-100'
                  }`}
                />
              ))}
           </div>
           <div className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2 border-2 border-black dark:border-white neo-shadow-sm hover:translate-y-0.5 transition-transform">
             <Flame className={`w-5 h-5 ${user.streak > 0 ? 'fill-white dark:fill-black animate-pulse' : 'text-gray-400'}`} />
             <span className="font-black text-xl font-mono tracking-tighter">{user.streak} DAY STREAK</span>
           </div>
        </div>
      </div>

      {/* Stats Grid - Monochrome */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
          <div className="flex items-center gap-3 mb-2 text-black dark:text-white">
            <Flame className="w-6 h-6" />
            <span className="font-bold uppercase text-sm tracking-wider">Total Burn</span>
          </div>
          <p className="text-4xl font-black dark:text-white">{user.totalCalories.toLocaleString()} <span className="text-sm font-normal text-gray-500">kcal</span></p>
        </Card>
        
        <Card className="bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
          <div className="flex items-center gap-3 mb-2 text-black dark:text-white">
            <Clock className="w-6 h-6" />
            <span className="font-bold uppercase text-sm tracking-wider">Time Trained</span>
          </div>
          <p className="text-4xl font-black dark:text-white">{user.totalHours.toFixed(1)} <span className="text-sm font-normal text-gray-500">hrs</span></p>
        </Card>

        <Card className="bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
          <div className="flex items-center gap-3 mb-2 text-black dark:text-white">
            <Trophy className="w-6 h-6" />
            <span className="font-bold uppercase text-sm tracking-wider">Badges</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.badges.length > 0 ? user.badges.map((badge, i) => (
              <span key={i} className="text-xs font-bold border border-black dark:border-white px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-white" title={badge}>{badge}</span>
            )) : <span className="text-gray-400 text-sm italic">Train to earn badges</span>}
          </div>
        </Card>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
           {/* Prominent Upload Zone */}
           <div 
              onClick={onUploadClick}
              className="group cursor-pointer border-4 border-dashed border-black dark:border-white rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-black transition-all hover:neo-shadow active:scale-[0.99]"
           >
              <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase dark:text-white">Upload Workout</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">Drag and drop your video here or click to browse. Get pro-level analysis in minutes.</p>
           </div>

           {/* Activity Chart */}
           <Card title="CALORIE TREND (LAST 7 DAYS)">
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartStrokeColor} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={chartStrokeColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '0px', 
                        border: isDarkMode ? '2px solid white' : '2px solid black', 
                        boxShadow: isDarkMode ? '4px 4px 0px 0px rgba(255,255,255,1)' : '4px 4px 0px 0px rgba(0,0,0,1)',
                        backgroundColor: isDarkMode ? '#000' : '#fff',
                        color: isDarkMode ? '#fff' : '#000'
                      }}
                      itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
                      cursor={{ stroke: chartStrokeColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="calories" stroke={chartStrokeColor} strokeWidth={2} fillOpacity={1} fill="url(#colorCal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </Card>

           <div>
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                <h3 className="text-lg font-black uppercase tracking-wider dark:text-white">Recent Sessions</h3>
              </div>
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-400 font-mono text-sm">NO DATA AVAILABLE</p>
                  </div>
                ) : (
                  sessions.slice(0, 3).map(session => (
                    <div 
                      key={session.id} 
                      onClick={() => onViewSession(session)}
                      className="group bg-white dark:bg-black border border-black dark:border-white rounded-lg p-5 flex justify-between items-center hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all cursor-pointer neo-shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white group-hover:bg-white dark:group-hover:bg-black group-hover:text-black dark:group-hover:text-white p-3 rounded-md transition-colors">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg uppercase dark:text-white group-hover:text-white dark:group-hover:text-black">{session.data.session_summary.sport}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-300 dark:group-hover:text-gray-600 font-mono">
                            {new Date(session.date).toLocaleDateString()} • {Math.floor(session.data.session_summary.estimated_duration_sec / 60)}m
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {session.data.session_summary.score !== undefined && (
                          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded group-hover:bg-white/20 dark:group-hover:bg-black/20">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-black text-lg group-hover:text-white dark:group-hover:text-black dark:text-white">{session.data.session_summary.score}</span>
                          </div>
                        )}
                        <div className="text-right">
                          <span className="block font-bold text-lg dark:text-white group-hover:text-white dark:group-hover:text-black">{session.data.session_summary.calories_estimate} <span className="text-xs font-normal opacity-70">kcal</span></span>
                        </div>
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 dark:text-white dark:group-hover:text-black" />
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CoachAvatar />
          
          {/* Enhanced Weight Card */}
          <Card className="bg-white dark:bg-black border-black dark:border-white relative overflow-hidden">
             <div className="flex items-start justify-between relative z-10">
                <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-gray-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Current Weight</span>
                        </div>
                        <button 
                          onClick={() => setShowWeightHistory(!showWeightHistory)}
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${showWeightHistory ? 'text-black dark:text-white' : 'text-gray-400'}`}
                          title="View History"
                        >
                          <History className="w-3 h-3" />
                        </button>
                    </div>
                    
                    {isEditingWeight ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <input 
                                ref={weightInputRef}
                                type="number" 
                                value={weightInput}
                                onChange={(e) => setWeightInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveWeight}
                                className="w-full p-1 bg-transparent text-3xl font-black border-b-2 border-black dark:border-white focus:outline-none dark:text-white"
                                placeholder="0.0"
                            />
                            <span className="text-sm font-bold text-gray-500 self-end mb-2">kg</span>
                        </div>
                    ) : (
                        <div className="group cursor-pointer" onClick={() => {
                            setWeightInput(user.weight?.toString() || '');
                            setIsEditingWeight(true);
                        }}>
                          <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black dark:text-white group-hover:underline decoration-2 underline-offset-4">{user.weight}</span>
                              <span className="text-sm font-bold text-gray-500">kg</span>
                              <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-black dark:group-hover:text-white ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {weightHistoryData.length > 1 && (
                            <div className="flex items-center gap-1 mt-1">
                               {user.weight! < weightHistoryData[0].weight ? (
                                 <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />
                               ) : user.weight! > weightHistoryData[0].weight ? (
                                 <TrendingUp className="w-3 h-3 text-red-500" />
                               ) : (
                                 <span className="w-2 h-0.5 bg-gray-400"></span>
                               )}
                               <span className="text-xs text-gray-400">
                                 {Math.abs(user.weight! - weightHistoryData[0].weight).toFixed(1)}kg change
                               </span>
                            </div>
                          )}
                        </div>
                    )}

                    {/* Mini Sparkline for History */}
                    {(showWeightHistory || weightHistoryData.length > 1) && (
                      <div className={`mt-4 h-16 w-full transition-all duration-300 ${showWeightHistory ? 'opacity-100' : 'opacity-40 grayscale hover:grayscale-0'}`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weightHistoryData}>
                            <Line 
                              type="monotone" 
                              dataKey="weight" 
                              stroke={isDarkMode ? "#fff" : "#000"} 
                              strokeWidth={2} 
                              dot={{ r: 2, fill: isDarkMode ? "#fff" : "#000" }} 
                            />
                            <Tooltip 
                              contentStyle={{ 
                                fontSize: '10px', 
                                padding: '4px',
                                border: '1px solid #666',
                                background: isDarkMode ? '#000' : '#fff',
                                color: isDarkMode ? '#fff' : '#000'
                              }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                </div>
             </div>
          </Card>

          <Card title="WEEKLY FOCUS" className="bg-black dark:bg-white text-white dark:text-black border-black dark:border-white">
             {sessions.length > 0 ? (
               <div className="space-y-6">
                 <p className="font-medium text-xl leading-relaxed border-l-2 border-white dark:border-black pl-4">
                   "{sessions[0].data.personalized_plan.weekly_focus}"
                 </p>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/10 dark:bg-black/10 p-3 rounded-md backdrop-blur-sm">
                        <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-600 mb-1">Target</p>
                        <p className="font-bold font-mono text-sm">{sessions[0].data.personalized_plan.sessions_per_week} SESSIONS</p>
                    </div>
                    <div className="bg-white/10 dark:bg-black/10 p-3 rounded-md backdrop-blur-sm">
                        <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-600 mb-1">Status</p>
                        <p className="font-bold font-mono text-sm">ACTIVE</p>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="space-y-6">
                 {/* Fallback to Initial Program based on Age/Weight */}
                 <div>
                   <p className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-1">Recommended Start</p>
                   <p className="font-medium text-xl leading-relaxed border-l-2 border-white dark:border-black pl-4">
                     "{user.initial_program || 'General Conditioning'}"
                   </p>
                 </div>
                 <div className="py-4 text-center text-gray-500 border-t border-gray-800 dark:border-gray-200">
                   <p className="text-sm">Upload a video for a tailored plan.</p>
                 </div>
               </div>
             )}
          </Card>

           <div className="bg-white dark:bg-black p-6 border-2 border-black dark:border-white rounded-xl neo-shadow-sm">
              <h3 className="font-black uppercase mb-4 text-sm tracking-wider dark:text-white">Quick Actions</h3>
              <div className="space-y-2">
                <Button onClick={onScheduleClick} variant="outline" fullWidth className="justify-start text-sm">
                  <Calendar className="w-4 h-4 mr-2" /> Schedule Next Workout
                </Button>
                <Button onClick={onManualLogClick} variant="outline" fullWidth className="justify-start text-sm">
                  <Activity className="w-4 h-4 mr-2" /> Log Manual Activity
                </Button>
                <Button onClick={() => exportProfileData(user, sessions)} variant="outline" fullWidth className="justify-start text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Download className="w-4 h-4 mr-2" /> Download Profile Data
                </Button>
              </div>
           </div>

           {/* Upcoming Workouts */}
           <Card title="UPCOMING" className="border-black dark:border-white">
              {upcomingWorkouts.length === 0 ? (
                 <p className="text-gray-400 text-sm italic py-2">No workouts scheduled.</p>
              ) : (
                 <div className="space-y-3">
                    {upcomingWorkouts.slice(0, 3).map((w, idx) => (
                      <div key={idx} className="flex gap-3 items-start border-l-2 border-black dark:border-white pl-3 py-1">
                         <div className="bg-black dark:bg-white text-white dark:text-black rounded text-center min-w-[3rem] py-1">
                            <span className="block text-xs font-bold uppercase">{new Date(w.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                            <span className="block text-lg font-black leading-none">{new Date(w.date).getDate()}</span>
                         </div>
                         <div>
                            <p className="font-bold text-sm dark:text-white">{w.exercise}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {w.time}
                            </p>
                         </div>
                      </div>
                    ))}
                 </div>
              )}
           </Card>

          {/* Daily Log History */}
          <Card title="CALORIE LOG" className="max-h-80 overflow-y-auto scrollbar-hide">
            {(user.daily_calories_log || []).length === 0 ? (
               <p className="text-gray-400 text-sm">No history yet.</p>
            ) : (
               <div className="space-y-3">
                  {[...(user.daily_calories_log || [])].reverse().map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                       <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold dark:text-white">{new Date(entry.date).toLocaleDateString()}</span>
                       </div>
                       <span className="font-mono font-bold text-sm dark:text-white">{entry.calories} kcal</span>
                    </div>
                  ))}
               </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
