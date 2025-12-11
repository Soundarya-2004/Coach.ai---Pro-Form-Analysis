import React, { useState } from 'react';
import { X, Calendar, Clock, Dumbbell } from 'lucide-react';
import { Button } from './Button';
import { ScheduledWorkout } from '../types';

interface ScheduleModalProps {
  onSave: (workout: ScheduledWorkout) => void;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ onSave, onClose }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [exercise, setExercise] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time && exercise) {
      onSave({ date, time, exercise });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-white/10 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-black w-full max-w-md p-6 rounded-2xl border-2 border-black dark:border-white neo-shadow relative transition-colors duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 dark:text-white">
          <Calendar className="w-6 h-6" /> Schedule Workout
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 dark:text-gray-300">Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-3 border-2 border-black dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 dark:text-gray-300">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full p-3 pl-10 border-2 border-black dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 dark:text-gray-300">Exercise Focus</label>
            <div className="relative">
              <Dumbbell className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input 
                type="text" 
                placeholder="e.g. HIIT, Yoga, Cricket Drills"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                required
                className="w-full p-3 pl-10 border-2 border-black dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth>Confirm Schedule</Button>
          </div>
        </form>
      </div>
    </div>
  );
};