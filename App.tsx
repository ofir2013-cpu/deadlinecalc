
import React, { useState } from 'react';
import ResultDisplay, { type Result } from './components/ResultDisplay';

const CalendarIcon: React.FC<{className: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const formatDateDifference = (startDate: Date, endDate: Date): string => {
    if (startDate > endDate) return "0 ימים";

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
        months--;
        const lastDayOfPrevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
    }

    if (months < 0) {
        years--;
        months += 12;
    }
    
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'שנה' : 'שנים'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'חודש' : 'חודשים'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'יום' : 'ימים'}`);
    
    if (parts.length === 0) return "0 ימים";
    if (parts.length === 1) return parts[0];

    const last = parts.pop()!;
    return `${parts.join(', ')}, ו${last}`;
};

const parseDateInput = (dateStr: string): Date | null => {
    const match = dateStr.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/);
    if (!match) return null;

    const [, dayStr, monthStr, yearStr] = match;
    const dayNum = parseInt(dayStr);
    const monthNum = parseInt(monthStr);
    let yearNum = parseInt(yearStr);

    if (yearStr.length === 2) {
        yearNum += 2000;
    }

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) || dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
        return null;
    }

    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
        return null;
    }
    date.setHours(0, 0, 0, 0);
    return date;
};


const App: React.FC = () => {
  const [dateInput, setDateInput] = useState<string>('');
  const [isNonReckonable, setIsNonReckonable] = useState<boolean>(false);
  const [nonReckonableStart, setNonReckonableStart] = useState<string>('');
  const [nonReckonableEnd, setNonReckonableEnd] = useState<string>('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const startDate = parseDateInput(dateInput);
    if (!startDate) {
        setError("פורמט תאריך ההתחלה אינו חוקי. יש להשתמש בפורמט DD/MM/YYYY או DD/MM/YY.");
        return;
    }

    let nonReckonableDurationDays = 0;
    let nonReckonableExplanation = '';

    if (isNonReckonable) {
        const nonReckonableStartDate = parseDateInput(nonReckonableStart);
        const nonReckonableEndDate = parseDateInput(nonReckonableEnd);

        if (!nonReckonableStartDate || !nonReckonableEndDate) {
            setError("יש להזין תאריכי התחלה וסוף חוקיים עבור התקופה הבלתי נמנית.");
            return;
        }
        if (nonReckonableEndDate.getTime() <= nonReckonableStartDate.getTime()) {
            setError("תאריך הסיום של התקופה הבלתי נמנית חייב להיות לאחר תאריך ההתחלה שלה.");
            return;
        }
        
        nonReckonableDurationDays = Math.round((nonReckonableEndDate.getTime() - nonReckonableStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        nonReckonableExplanation = ` הדד-ליין נדחה ב-${nonReckonableDurationDays} ימים נוספים בשל התקופה הבלתי נמנית שהוזנה.`;
    }

    const cutoffDate = new Date('2026-01-01');
    cutoffDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let baseDeadline: Date;
    let baseExplanation: string;

    if (startDate.getTime() >= cutoffDate.getTime()) {
        // Rule 1: Start date is on or after 1.1.2026 -> 1.5 years deadline
        baseDeadline = new Date(startDate);
        baseDeadline.setMonth(baseDeadline.getMonth() + 18);
        baseExplanation = "הדד-ליין הוא שנה וחצי לאחר מועד ההתחלה, מכיוון שמועד ההתחלה חל ב-1.1.2026 או לאחריו.";
    } else {
        // Rule 2: Start date is before 1.1.2026
        const potentialDeadlineTwoYears = new Date(startDate);
        potentialDeadlineTwoYears.setFullYear(potentialDeadlineTwoYears.getFullYear() + 2);

        if (potentialDeadlineTwoYears.getTime() < cutoffDate.getTime()) {
            // Sub-rule 2a: 2-year deadline is also before 1.1.2026 -> 2 years deadline
            baseDeadline = potentialDeadlineTwoYears;
            baseExplanation = "הדד-ליין הוא שנתיים לאחר מועד ההתחלה, מכיוון שהוא חל לפני 1.1.2026.";
        } else {
            // Sub-rule 2b: 2-year deadline is on or after 1.1.2026 -> 1.5 years deadline
            baseDeadline = new Date(startDate);
            baseDeadline.setMonth(baseDeadline.getMonth() + 18);
            baseExplanation = "הדד-ליין הוא שנה וחצי ממועד ההתחלה. חישוב של שנתיים היה חורג מתאריך 1.1.2026, ולכן הכלל המעודכן הוא שנה וחצי.";
        }
    }
    
    const finalDeadline = new Date(baseDeadline);
    if(nonReckonableDurationDays > 0) {
        finalDeadline.setDate(finalDeadline.getDate() + nonReckonableDurationDays);
    }
    
    const explanation = baseExplanation + nonReckonableExplanation;

    let daysPassed: string;
    if (startDate.getTime() > today.getTime()) {
      daysPassed = "מועד ההתחלה הוא בעתיד.";
    } else {
      daysPassed = formatDateDifference(startDate, today);
    }

    const formatDate = (date: Date) => date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setResult({
      deadline: formatDate(finalDeadline),
      explanation: explanation,
      daysPassed: daysPassed,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-[Arial]">
      <main className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 transform transition-all">
        <div className="text-center mb-8">
            <CalendarIcon className="w-16 h-16 mx-auto text-indigo-500" />
            <h1 className="text-4xl font-bold text-gray-800 mt-4">מחשבון דד-ליין</h1>
            <p className="text-gray-500 mt-2">הזן מועד התחלה כדי לחשב את תקופת הזמן ומועד הסיום.</p>
        </div>

        <div className="space-y-6">
            <div>
                <label htmlFor="date-input" className="block text-lg font-semibold text-gray-700 mb-2">מועד התחלה</label>
                <input 
                    id="date-input"
                    type="text"
                    placeholder="הזן תאריך (לדוגמה: 25.12.23 או 25.12.2023)"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-4 py-3 text-center border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    aria-label="מועד התחלה"
                />
            </div>

            <div className="pt-2">
                <div className="flex items-center">
                    <input
                        id="non-reckonable-checkbox"
                        type="checkbox"
                        checked={isNonReckonable}
                        onChange={(e) => setIsNonReckonable(e.target.checked)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        aria-labelledby="non-reckonable-label"
                    />
                    <label id="non-reckonable-label" htmlFor="non-reckonable-checkbox" className="mr-3 text-lg font-semibold text-gray-700 cursor-pointer">
                        הוסף תקופה בלתי נמנית
                    </label>
                </div>
            </div>

            {isNonReckonable && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-4 animate-fade-in-slow">
                    <h3 className="text-lg font-semibold text-gray-600 text-center">תקופה בלתי נמנית</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="non-reckonable-start" className="block text-md font-medium text-gray-700 mb-1">תחילה</label>
                            <input
                                id="non-reckonable-start"
                                type="text"
                                placeholder="DD/MM/YY"
                                value={nonReckonableStart}
                                onChange={(e) => setNonReckonableStart(e.target.value)}
                                className="w-full px-4 py-2 text-center border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                aria-label="תחילת תקופה בלתי נמנית"
                            />
                        </div>
                        <div>
                            <label htmlFor="non-reckonable-end" className="block text-md font-medium text-gray-700 mb-1">סוף</label>
                            <input
                                id="non-reckonable-end"
                                type="text"
                                placeholder="DD/MM/YY"
                                value={nonReckonableEnd}
                                onChange={(e) => setNonReckonableEnd(e.target.value)}
                                className="w-full px-4 py-2 text-center border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                aria-label="סוף תקופה בלתי נמנית"
                            />
                        </div>
                    </div>
                     <style>{`
                        @keyframes fade-in-slow {
                            from { opacity: 0; transform: translateY(-5px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fade-in-slow {
                            animation: fade-in-slow 0.4s ease-out forwards;
                        }
                    `}</style>
                </div>
            )}


            {error && <p className="text-red-600 text-center font-semibold bg-red-100 p-3 rounded-lg">{error}</p>}
            
            <button
              onClick={handleCalculate}
              className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:scale-105 transition-transform duration-200 text-xl"
            >
              חשב דד-ליין
            </button>
        </div>

        {result && <ResultDisplay result={result} />}
      </main>
    </div>
  );
};

export default App;
