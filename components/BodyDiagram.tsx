import React from 'react';

interface BodyDiagramProps {
  highlightedPart: string | null;
  className?: string;
}

export const BodyDiagram: React.FC<BodyDiagramProps> = ({ highlightedPart, className = '' }) => {
  const isHighlighted = (part: string) => {
    if (!highlightedPart) return false;
    const normalized = highlightedPart.toLowerCase();
    const target = part.toLowerCase();
    // Check if the target keyword exists in the highlighted string (handles "knees and hips")
    return normalized.includes(target);
  };

  const baseColor = "stroke-gray-300 dark:stroke-gray-700";
  // Enhanced active style with drop shadow for clarity
  const activeColor = "stroke-black dark:stroke-white fill-black dark:fill-white drop-shadow-[0_0_4px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]";
  const activeStroke = "stroke-black dark:stroke-white drop-shadow-[0_0_4px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]";
  
  // Helper to determine class string
  const getStrokeClasses = (partKeys: string[]) => {
    const active = partKeys.some(key => isHighlighted(key));
    return active 
      ? `${activeStroke} stroke-[4px] opacity-100` 
      : `${baseColor} stroke-[2px] opacity-40`;
  };

  // Specific fill classes for joints
  const getJointClasses = (partKeys: string[]) => {
    const active = partKeys.some(key => isHighlighted(key));
    return active 
      ? `fill-white dark:fill-black ${activeStroke} stroke-[3px] opacity-100 scale-125` 
      : `fill-white dark:fill-black ${baseColor} stroke-[2px] opacity-40`;
  };

  return (
    <div className={`relative flex items-center justify-center p-4 ${className}`}>
      <svg 
        viewBox="0 0 200 400" 
        className="h-64 w-auto transition-all duration-300"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Head & Neck */}
        <circle 
          cx="100" cy="40" r="25" 
          className={`transition-all duration-300 ${getStrokeClasses(['head', 'neck', 'gaze', 'cervical', 'chin'])}`}
        />
        
        {/* Spine/Torso/Core */}
        <line 
          x1="100" y1="65" x2="100" y2="180" 
          className={`transition-all duration-300 ${getStrokeClasses(['spine', 'back', 'torso', 'posture', 'core', 'abs', 'trunk', 'chest', 'lumbar'])}`}
        />
        
        {/* Shoulders */}
        <line 
          x1="60" y1="75" x2="140" y2="75" 
          className={`transition-all duration-300 ${getStrokeClasses(['shoulders', 'shoulder', 'scapula', 'delts', 'traps', 'upper body'])}`}
        />
        <circle cx="60" cy="75" r="6" className={`transition-all duration-300 ${getJointClasses(['shoulders', 'shoulder', 'scapula'])}`} />
        <circle cx="140" cy="75" r="6" className={`transition-all duration-300 ${getJointClasses(['shoulders', 'shoulder', 'scapula'])}`} />

        {/* Arms (Left) */}
        <line x1="60" y1="75" x2="40" y2="160" className={`transition-all duration-300 ${getStrokeClasses(['arms', 'elbows', 'biceps', 'triceps', 'wrists', 'hands', 'grip'])}`} />
        <circle cx="50" cy="117" r="5" className={`transition-all duration-300 ${getJointClasses(['elbows'])}`} />

        {/* Arms (Right) */}
        <line x1="140" y1="75" x2="160" y2="160" className={`transition-all duration-300 ${getStrokeClasses(['arms', 'elbows', 'biceps', 'triceps', 'wrists', 'hands', 'grip'])}`} />
        <circle cx="150" cy="117" r="5" className={`transition-all duration-300 ${getJointClasses(['elbows'])}`} />

        {/* Hips/Pelvis */}
        <path 
          d="M70 180 L130 180 L100 210 Z" 
          className={`transition-all duration-300 stroke-2 ${getStrokeClasses(['hips', 'pelvis', 'glutes', 'hip flexors', 'lumbar'])}`} 
        />
        <circle cx="70" cy="180" r="6" className={`transition-all duration-300 ${getJointClasses(['hips', 'pelvis'])}`} />
        <circle cx="130" cy="180" r="6" className={`transition-all duration-300 ${getJointClasses(['hips', 'pelvis'])}`} />

        {/* Legs (Left) */}
        <line x1="85" y1="200" x2="85" y2="360" className={`transition-all duration-300 ${getStrokeClasses(['legs', 'knees', 'ankles', 'feet', 'quads', 'hamstrings', 'thighs', 'calves'])}`} />
        {/* Knee Left */}
        <circle cx="85" cy="280" r="8" className={`transition-all duration-300 ${getJointClasses(['knees', 'patella'])}`} />
        {/* Ankle Left */}
        <circle cx="85" cy="360" r="5" className={`transition-all duration-300 ${getJointClasses(['ankles', 'feet', 'heels', 'toes'])}`} />

        {/* Legs (Right) */}
        <line x1="115" y1="200" x2="115" y2="360" className={`transition-all duration-300 ${getStrokeClasses(['legs', 'knees', 'ankles', 'feet', 'quads', 'hamstrings', 'thighs', 'calves'])}`} />
        {/* Knee Right */}
        <circle cx="115" cy="280" r="8" className={`transition-all duration-300 ${getJointClasses(['knees', 'patella'])}`} />
        {/* Ankle Right */}
        <circle cx="115" cy="360" r="5" className={`transition-all duration-300 ${getJointClasses(['ankles', 'feet', 'heels', 'toes'])}`} />

      </svg>
      
      {/* Label for highlighted part */}
      {highlightedPart && (
        <div className="absolute bottom-0 left-0 right-0 text-center animate-fade-in-up pointer-events-none">
          <span className="inline-block bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase px-3 py-1 tracking-widest neo-shadow-sm">
            {highlightedPart}
          </span>
        </div>
      )}
    </div>
  );
};