import React, { useState } from 'react';
import { X, Activity, Flame, Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { ManualActivity } from '../types';

interface ManualLogModalProps {
  logs: ManualActivity[];
  onSave: (activity: ManualActivity) => void;
  onClose: () => void;
}

export const ManualLogModal: React.FC<ManualLogModalProps> = ({ logs, onSave, onClose }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && exercise && duration && calories) {
      const newActivity: ManualActivity = {
        id: Date.now().toString(),
        date,
        exercise,
        duration_sec: parseInt(duration) * 60, // Convert minutes to seconds
        calories: parseInt(calories),
        intensity_level: intensity
      };
      onSave(newActivity);
      // Reset form
      setExercise('');
      setDuration('');
      setCalories('');
      setIntensity('Medium');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-white/10 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-black w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border-2 border-black dark:border-white neo-shadow relative overflow-hidden transition-colors duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-black sticky top-0 z-10">
          <h2 className="text-2xl font-black uppercase flex items-center gap-2 dark:text-white">
            <Activity className="w-6 h-6" /> Manual Activity Log
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8">
          
          {/* Entry Form */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
             <h3 className="font-bold text-sm uppercase mb-4 flex items-center gap-2 dark:text-white">
               <Plus className="w-4 h-4" /> Add New Entry
             </h3>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input 
                    type="text" 
                    placeholder="Exercise Name (e.g. Running, Swimming)"
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    required
                    className="w-full p-3 border border-black dark:border-white dark:bg-black dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white placeholder-gray-500"
                  />
                </div>
                
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full p-3 border border-black dark:border-white dark:bg-black dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white font-mono text-sm"
                />
                
                <select 
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full p-3 border border-black dark:border-white rounded-lg focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black dark:text-white"
                >
                  <option value="Low">Low Intensity</option>
                  <option value="Medium">Medium Intensity</option>
                  <option value="High">High Intensity</option>
                </select>

                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Duration (mins)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    min="1"
                    className="w-full p-3 border border-black dark:border-white dark:bg-black dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white placeholder-gray-500"
                  />
                  <Clock className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Calories Burned"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    required
                    min="1"
                    className="w-full p-3 border border-black dark:border-white dark:bg-black dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white placeholder-gray-500"
                  />
                  <Flame className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="md:col-span-2">
                  <Button type="submit" fullWidth>Log Activity</Button>
                </div>
             </form>
          </div>

          {/* History Table */}
          <div>
            <h3 className="font-black text-lg uppercase mb-4 dark:text-white">History</h3>
            <div className="overflow-x-auto border-2 border-black dark:border-white rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-black dark:bg-white text-white dark:text-black uppercase text-xs">
                  <tr>
                    <th className="p-4 font-bold tracking-wider">Date</th>
                    <th className="p-4 font-bold tracking-wider">Exercise</th>
                    <th className="p-4 font-bold tracking-wider">Stats</th>
                    <th className="p-4 font-bold tracking-wider">Intensity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-black">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400 italic">No manual entries logged yet.</td>
                    </tr>
                  ) : (
                    [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <td className="p-4 font-mono font-medium dark:text-white">{log.date}</td>
                        <td className="p-4 font-bold dark:text-white">{log.exercise}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold dark:text-white">{log.calories} kcal</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">{Math.round(log.duration_sec / 60)} mins</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 text-[10px] uppercase font-bold border ${
                            log.intensity_level === 'High' ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' :
                            log.intensity_level === 'Medium' ? 'bg-gray-200 text-black border-gray-400 dark:bg-gray-800 dark:text-white dark:border-gray-600' :
                            'bg-white text-gray-500 border-gray-200 dark:bg-black dark:text-gray-300 dark:border-gray-700'
                          }`}>
                            {log.intensity_level}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};