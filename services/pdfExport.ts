
import { User, WorkoutSession, SessionSummary } from '../types';

// Helper to sanitize text for PDF
// Ensures no undefined, null, or object references are printed.
// Strips characters that might break standard PDF font encoding.
const safeText = (text: any, fallback: string = ''): string => {
  if (text === null || text === undefined) return fallback;
  
  // If it's an object (and not null), try to return a sensible fallback or empty
  if (typeof text === 'object') {
     return ''; 
  }
  
  const str = String(text);
  
  // Remove non-ASCII characters to prevent font encoding issues in standard PDF fonts
  // Keep only printable ASCII (0x20 to 0x7E)
  return str.replace(/[^\x20-\x7E]/g, '').trim();
};

export const exportProfileData = (user: User, sessions: WorkoutSession[]) => {
  if (!window.jspdf) {
    alert("PDF generator is initializing, please try again in a moment.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Formatting constants
  let yPos = 20;
  const margin = 20;
  const lineHeight = 7;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text(safeText("Coach.ai - Athlete Profile"), margin, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(safeText(`Generated on: ${new Date().toLocaleString()}`), margin, yPos);
  yPos += 15;

  // Stats Summary
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(safeText("Profile Overview"), margin, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  
  // Prepare safe values
  const name = safeText(user.name, 'Athlete');
  const streak = safeText(user.streak, '0');
  const weight = safeText(user.weight, '--');
  const totalHours = typeof user.totalHours === 'number' ? user.totalHours.toFixed(1) : '0.0';
  const age = safeText(user.age, '--');
  const totalCalories = safeText(user.totalCalories, '0');
  const initProgram = safeText(user.initial_program, 'Standard Program');

  doc.text(`Name: ${name}`, margin, yPos);
  doc.text(`Current Streak: ${streak} Days`, margin + 80, yPos);
  yPos += lineHeight;
  
  doc.text(`Weight: ${weight} kg`, margin, yPos);
  doc.text(`Total Training: ${totalHours} hrs`, margin + 80, yPos);
  yPos += lineHeight;
  
  doc.text(`Age: ${age} years`, margin, yPos);
  doc.text(`Total Burn: ${totalCalories} kcal`, margin + 80, yPos);
  yPos += lineHeight;

  doc.text(`Initial Program: ${initProgram}`, margin, yPos);
  
  if (user.badges && Array.isArray(user.badges) && user.badges.length > 0) {
      yPos += lineHeight;
      const badgesStr = user.badges.map(b => safeText(b)).join(', ');
      doc.text(`Badges: ${badgesStr}`, margin, yPos);
  }
  yPos += 15;

  // Weight History Table
  if (user.weight_history && Array.isArray(user.weight_history) && user.weight_history.length > 0) {
    doc.setFontSize(14);
    doc.text(safeText("Weight Log"), margin, yPos);
    yPos += 5;
    
    const weightData = user.weight_history.map(w => [
      safeText(w.date), 
      safeText(w.weight ? `${w.weight} kg` : '')
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Date', 'Weight']],
      body: weightData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Workout Sessions
  if (sessions && Array.isArray(sessions) && sessions.length > 0) {
    doc.setFontSize(14);
    doc.text(safeText("Workout History"), margin, yPos);
    yPos += 5;

    const sessionData = sessions.map(s => {
      const summary: Partial<SessionSummary> = s.data?.session_summary || {};
      const durationMin = typeof summary.estimated_duration_sec === 'number' 
        ? Math.round(summary.estimated_duration_sec / 60) 
        : 0;
      
      return [
        safeText(new Date(s.date).toLocaleDateString()),
        safeText(summary.sport),
        `${durationMin} min`,
        `${safeText(summary.calories_estimate, '0')} kcal`,
        summary.score ? `${summary.score}/100` : 'N/A'
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: [['Date', 'Sport', 'Duration', 'Burn', 'Score']],
      body: sessionData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Manual Logs
  if (user.manual_activity_log && Array.isArray(user.manual_activity_log) && user.manual_activity_log.length > 0) {
    // Basic pagination check
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text(safeText("Manual Activity Logs"), margin, yPos);
    yPos += 5;
    
    const manualData = user.manual_activity_log.map(m => [
        safeText(m.date),
        safeText(m.exercise),
        `${Math.round((m.duration_sec || 0) / 60)} min`,
        `${safeText(m.calories, '0')} kcal`,
        safeText(m.intensity_level)
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Date', 'Activity', 'Duration', 'Burn', 'Intensity']],
        body: manualData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
        styles: { fontSize: 10 },
        margin: { left: margin, right: margin }
    });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`CoachAI_Data_${dateStr}.pdf`);
};
