import React, { useState } from 'react';
import ResultDisplay, { type Result } from './components/ResultDisplay';

interface NonReckonablePeriod {
  id: number;
  start: string;
  end: string;
}

const CalendarIcon: React.FC<{className: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrashIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
  const [nonReckonablePeriods, setNonReckonablePeriods] = useState<NonReckonablePeriod[]>([]);
  const [nextId, setNextId] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleToggleNonReckonable = (checked: boolean) => {
    setIsNonReckonable(checked);
    if (checked && nonReckonablePeriods.length === 0) {
      setNonReckonablePeriods([{ id: 0, start: '', end: '' }]);
    } else if (!checked) {
      setNonReckonablePeriods([]);
    }
  };

  const handleAddPeriod = () => {
    setNonReckonablePeriods([...nonReckonablePeriods, { id: nextId, start: '', end: '' }]);
    setNextId(nextId + 1);
  };
  
  const handleRemovePeriod = (idToRemove: number) => {
    const updatedPeriods = nonReckonablePeriods.filter(p => p.id !== idToRemove);
    setNonReckonablePeriods(updatedPeriods);
    if (updatedPeriods.length === 0) {
        setIsNonReckonable(false);
    }
  };
  
  const handlePeriodChange = (id: number, field: 'start' | 'end', value: string) => {
    setNonReckonablePeriods(
        nonReckonablePeriods.map(p => 
            p.id === id ? { ...p, [field]: value } : p
        )
    );
  };


  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const startDate = parseDateInput(dateInput);
    if (!startDate) {
        setError("פורמט תאריך ההתחלה אינו חוקי. יש להשתמש בפורמט DD/MM/YYYY או DD/MM/YY.");
        return;
    }

    let totalNonReckonableDays = 0;
    let nonReckonableExplanation = '';

    if (isNonReckonable) {
        if (nonReckonablePeriods.length === 0) {
            setError("יש להוסיף לפחות תקופה בלתי נמנית אחת או לבטל את הבחירה.");
            return;
       }
       
       for (const [index, period] of nonReckonablePeriods.entries()) {
           const nonReckonableStartDate = parseDateInput(period.start);
           const nonReckonableEndDate = parseDateInput(period.end);

           if (!nonReckonableStartDate || !nonReckonableEndDate) {
               setError(`יש להזין תאריכים חוקיים עבור תקופה בלתי נמנית מספר ${index + 1}.`);
               return;
           }
           if (nonReckonableEndDate.getTime() <= nonReckonableStartDate.getTime()) {
               setError(`תאריך הסיום של תקופה בלתי נמנית מספר ${index + 1} חייב להיות לאחר תאריך ההתחלה שלה.`);
               return;
           }
           
           const duration = Math.round((nonReckonableEndDate.getTime() - nonReckonableStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
           totalNonReckonableDays += duration;
       }

       if(totalNonReckonableDays > 0) {
            const periodText = nonReckonablePeriods.length === 1 ? 'תקופה בלתי נמנית' : `${nonReckonablePeriods.length} תקופות בלתי נמנות`;
            nonReckonableExplanation = ` הדד-ליין נדחה ב-${totalNonReckonableDays} ימים נוספים בשל ${periodText} שהוזנו.`;
       }
    }

    const cutoffDate = new Date('2026-01-01');
    cutoffDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let baseDeadline: Date;
    let baseExplanation: string;

    if (startDate.getTime() >= cutoffDate.getTime()) {
        baseDeadline = new Date(startDate);
        baseDeadline.setMonth(baseDeadline.getMonth() + 18);
        baseExplanation = "הדד-ליין הוא שנה וחצי לאחר מועד ההתחלה, מכיוון שמועד ההתחלה חל ב-1.1.2026 או לאחריו.";
    } else {
        const potentialDeadlineTwoYears = new Date(startDate);
        potentialDeadlineTwoYears.setFullYear(potentialDeadlineTwoYears.getFullYear() + 2);

        if (potentialDeadlineTwoYears.getTime() < cutoffDate.getTime()) {
            baseDeadline = potentialDeadlineTwoYears;
            baseExplanation = "הדד-ליין הוא שנתיים לאחר מועד ההתחלה, מכיוון שהוא חל לפני 1.1.2026.";
        } else {
            const eighteenMonthsAfterStart = new Date(startDate);
            eighteenMonthsAfterStart.setMonth(eighteenMonthsAfterStart.getMonth() + 18);

            if (today.getTime() >= eighteenMonthsAfterStart.getTime()) {
                baseDeadline = cutoffDate;
                baseExplanation = "הדד-ליין נקבע ל-1.1.2026. הכלל חל מכיוון שחישוב של שנתיים ממועד ההתחלה היה חורג מתאריך זה, וכבר עברה תקופה של שנה וחצי מאז מועד ההתחלה.";
            } else {
                baseDeadline = eighteenMonthsAfterStart;
                baseExplanation = "הדד-ליין הוא שנה וחצי ממועד ההתחלה. הכלל חל מכיוון שחישוב של שנתיים היה חורג מתאריך 1.1.2026, אך טרם עברה תקופה של שנה וחצי מאז מועד ההתחלה.";
            }
        }
    }
    
    const finalDeadline = new Date(baseDeadline);
    if(totalNonReckonableDays > 0) {
        finalDeadline.setDate(finalDeadline.getDate() + totalNonReckonableDays);
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
                        onChange={(e) => handleToggleNonReckonable(e.target.checked)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        aria-labelledby="non-reckonable-label"
                    />
                    <label id="non-reckonable-label" htmlFor="non-reckonable-checkbox" className="mr-3 text-lg font-semibold text-gray-700 cursor-pointer">
                        הוסף תקופה בלתי נמנית
                    </label>
                </div>
            </div>

            {isNonReckonable && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-gray-600 text-center">תקופות בלתי נמנות</h3>
                    {nonReckonablePeriods.map((period, index) => (
                        <div key={period.id} className="p-3 bg-slate-50 rounded-md space-y-3 relative">
                            <p className="text-md font-medium text-gray-600">תקופה {index + 1}</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor={`nr-start-${period.id}`} className="block text-sm font-medium text-gray-700 mb-1">תחילה</label>
                                    <input
                                        id={`nr-start-${period.id}`}
                                        type="text"
                                        placeholder="DD/MM/YY"
                                        value={period.start}
                                        onChange={(e) => handlePeriodChange(period.id, 'start', e.target.value)}
                                        className="w-full px-4 py-2 text-center border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        aria-label={`תחילת תקופה בלתי נמנית ${index + 1}`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`nr-end-${period.id}`} className="block text-sm font-medium text-gray-700 mb-1">סוף</label>
                                    <input
                                        id={`nr-end-${period.id}`}
                                        type="text"
                                        placeholder="DD/MM/YY"
                                        value={period.end}
                                        onChange={(e) => handlePeriodChange(period.id, 'end', e.target.value)}
                                        className="w-full px-4 py-2 text-center border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        aria-label={`סוף תקופה בלתי נמנית ${index + 1}`}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemovePeriod(period.id)}
                                className="absolute top-2 left-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                aria-label={`מחק תקופה ${index + 1}`}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={handleAddPeriod}
                        className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
                    >
                        + הוסף תקופה נוספת
                    </button>
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