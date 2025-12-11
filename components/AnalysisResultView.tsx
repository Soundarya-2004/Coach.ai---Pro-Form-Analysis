
import React, { useEffect, useState } from 'react';
import { AnalysisResponse } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { CheckCircle2, AlertTriangle, ArrowLeft, Dumbbell, CalendarCheck, Target, Layers, Calendar } from 'lucide-react';
import { BodyDiagram } from './BodyDiagram';

interface AnalysisResultViewProps {
  data: AnalysisResponse;
  onBack: () => void;
  date?: string;
  isHistorical?: boolean;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ 
  data, 
  onBack, 
  date,
  isHistorical = false
}) => {
  const [activeFocus, setActiveFocus] = useState<string | null>(null);

  useEffect(() => {
    // Only fire confetti for new analyses, not when viewing history
    if (!isHistorical && window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#000000', '#333333', '#666666'] // Monochrome confetti
      });
    }
  }, [isHistorical]);

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white';
      case 'moderate': return 'bg-gray-200 text-black border-gray-400 dark:bg-gray-800 dark:text-white dark:border-gray-600';
      default: return 'bg-white text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'; // minor
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-black dark:text-white'; // Elite
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-black dark:border-white pb-4 transition-colors duration-300">
        <Button variant="outline" onClick={onBack} className="p-2 px-3 rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight dark:text-white">Session Analysis</h1>
          {date && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
              <Calendar className="w-4 h-4" />
              <p className="text-sm font-mono font-medium">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Section - High Contrast */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* New Score Card */}
        <div className="bg-black dark:bg-white text-white dark:text-black p-5 rounded-none border-2 border-black dark:border-white neo-shadow hover:translate-y-1 transition-transform col-span-2 md:col-span-1">
          <p className="text-gray-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-1">Score</p>
          <div className="flex items-baseline">
            <span className="text-4xl font-black">{data.session_summary.score ?? 'N/A'}</span>
            <span className="text-sm font-bold opacity-70 ml-1">/100</span>
          </div>
        </div>

        <div className="bg-white dark:bg-black p-5 rounded-none border-2 border-black dark:border-white neo-shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Sport</p>
          <p className="text-xl font-bold truncate dark:text-white">{data.session_summary.sport}</p>
        </div>
        <div className="bg-white dark:bg-black p-5 rounded-none border-2 border-black dark:border-white neo-shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Duration</p>
          <p className="text-2xl font-black dark:text-white">{Math.round(data.session_summary.estimated_duration_sec / 60)}<span className="text-sm font-medium ml-1">min</span></p>
        </div>
        <div className="bg-white dark:bg-black p-5 rounded-none border-2 border-black dark:border-white neo-shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Intensity</p>
          <p className="text-2xl font-black uppercase dark:text-white">{data.session_summary.intensity_level}</p>
        </div>
        <div className="bg-white dark:bg-black p-5 rounded-none border-2 border-black dark:border-white neo-shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Calories</p>
          <p className="text-2xl font-black dark:text-white">{data.session_summary.calories_estimate}</p>
        </div>
      </div>

      {/* Exercise Detection Timeline */}
      <Card title="DETECTED EXERCISES" className="border-black dark:border-white">
        <div className="flex flex-wrap gap-4 mt-2">
          {data.exercise_detection.map((ex, idx) => (
             <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-black dark:border-white rounded-lg w-full md:w-auto">
                <Layers className="w-5 h-5 dark:text-white" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm uppercase dark:text-white">{ex.label}</p>
                    {ex.score !== undefined && (
                      <span className={`text-xs font-black px-1.5 py-0.5 border border-current rounded ${getScoreColor(ex.score)}`}>
                        {ex.score}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {ex.timestamp_range_sec[0]}s - {ex.timestamp_range_sec[1]}s • {Math.round(ex.confidence * 100)}% Match
                  </p>
                </div>
             </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Feedback & Diagram */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase flex items-center gap-2 border-b-2 border-black dark:border-white pb-2 dark:text-white">
            <CheckCircle2 className="w-6 h-6" /> Form Breakdown
          </h2>
          
          <div className="flex flex-col-reverse md:flex-row gap-6 items-start">
            {/* Feedback List */}
            <div className="flex-1 space-y-4 w-full">
              {data.form_feedback.map((item, idx) => (
                <div 
                  key={idx} 
                  onMouseEnter={() => setActiveFocus(item.body_focus)}
                  onMouseLeave={() => setActiveFocus(null)}
                  className={`bg-white dark:bg-black border-2 transition-all duration-200 p-5 relative group cursor-default neo-shadow-sm ${
                    activeFocus === item.body_focus 
                      ? 'border-black dark:border-white translate-x-1' 
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                   <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 uppercase border ${getSeverityStyle(item.severity)}`}>
                          {item.severity}
                        </span>
                        {item.body_focus && (
                          <span className="text-[10px] font-bold px-2 py-1 uppercase border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white">
                            {item.body_focus}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 border border-gray-200 dark:border-gray-700 dark:text-gray-300">
                        {item.timestamp_range_sec[0]}s - {item.timestamp_range_sec[1]}s
                      </span>
                   </div>
                   <h3 className="font-bold text-lg mb-2 leading-tight dark:text-white">{item.issue}</h3>
                   <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 border-l-2 border-gray-300 dark:border-gray-700 pl-3 italic">
                     {item.visual_overlay_hint}
                   </p>
                   
                   <div className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-sm flex items-start gap-3">
                     <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                     <div>
                       <p className="text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest mb-1">Coach Cue</p>
                       <p className="font-medium text-lg">"{item.cue}"</p>
                     </div>
                   </div>
                </div>
              ))}
            </div>

            {/* Interactive Body Diagram - Sticky on Desktop */}
            <div className="w-full md:w-1/3 shrink-0 flex justify-center sticky top-24 bg-white dark:bg-black border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-2 md:p-0 md:border-0 md:bg-transparent dark:md:bg-transparent">
               <BodyDiagram highlightedPart={activeFocus} />
            </div>
          </div>
        </div>

        {/* Right Column: Plan & Drills */}
        <div className="space-y-8">
          
          {/* Drills */}
          <Card title="DRILL PRESCRIPTION" className="bg-white dark:bg-black border-black dark:border-white">
             <div className="space-y-3 mt-4">
               {data.drill_recommendations.map((drill, idx) => (
                 <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors">
                    <div className="bg-white dark:bg-black p-2 border border-black dark:border-white rounded-full shrink-0 w-10 h-10 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold uppercase text-sm dark:text-white">{drill.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{drill.purpose}</p>
                    </div>
                    <div className="text-right">
                       <span className="inline-block bg-black dark:bg-white text-white dark:text-black text-xs font-mono px-2 py-1">
                         {drill.sets} x {drill.reps}
                       </span>
                    </div>
                 </div>
               ))}
             </div>
          </Card>

          {/* Weekly Plan */}
          <Card className="bg-black dark:bg-white text-white dark:text-black border-black dark:border-white">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 dark:border-gray-200 pb-4">
               <CalendarCheck className="w-6 h-6 text-white dark:text-black" />
               <h3 className="text-xl font-black uppercase">Next Week</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-gray-500 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2">Primary Focus</p>
                <p className="text-lg font-bold border-l-4 border-white dark:border-black pl-4 py-1">
                  {data.personalized_plan.weekly_focus}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-900 dark:bg-gray-100 p-4 border border-gray-800 dark:border-gray-200">
                    <p className="text-gray-500 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-1">Frequency</p>
                    <p className="font-bold text-xl">{data.personalized_plan.sessions_per_week} <span className="text-sm font-normal text-gray-400 dark:text-gray-600">sessions</span></p>
                 </div>
                 <div className="bg-gray-900 dark:bg-gray-100 p-4 border border-gray-800 dark:border-gray-200">
                    <p className="text-gray-500 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-1">Progression</p>
                    <p className="text-xs mt-1 leading-snug text-gray-300 dark:text-gray-800">{data.personalized_plan.progression_rules}</p>
                 </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-3">Milestones</p>
                <ul className="space-y-3">
                  {data.personalized_plan.milestones.map((m, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Target className="w-4 h-4 text-white dark:text-black" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
