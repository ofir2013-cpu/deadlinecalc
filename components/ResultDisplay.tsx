import React from 'react';

export interface Result {
  deadline: string;
  explanation: string;
  daysPassed: string;
}

interface ResultDisplayProps {
  result: Result;
}

const DeadlineIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
);
  
const TimePassedIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div className="mt-8 pt-6 border-t-2 border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">תוצאות החישוב</h2>
        <div className="space-y-6 bg-slate-50 p-6 rounded-lg">
            <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-green-100 p-3 rounded-full">
                    <DeadlineIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <p className="text-gray-500 text-sm">מועד הדד-ליין</p>
                    <p className="text-2xl font-bold text-gray-900">{result.deadline}</p>
                </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
                 <div className="bg-blue-100 p-3 rounded-full">
                    <TimePassedIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <p className="text-gray-500 text-sm">ימים שחלפו עד עתה</p>
                    <p className="text-2xl font-bold text-gray-900">{result.daysPassed}</p>
                </div>
            </div>

            <div className="pt-4">
                <p className="text-sm text-gray-600 font-semibold">הסבר על החישוב:</p>
                <p className="text-sm text-gray-500 italic mt-1">{result.explanation}</p>
            </div>
        </div>
    </div>
  );
};

export default ResultDisplay;