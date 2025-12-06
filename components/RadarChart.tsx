import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AssessmentScores } from '../types';

interface Props {
  data: AssessmentScores;
}

export const ProfileRadarChart: React.FC<Props> = ({ data }) => {
  const chartData = [
    { subject: 'Realistic', A: data.realistic, fullMark: 5 },
    { subject: 'Investigative', A: data.investigative, fullMark: 5 },
    { subject: 'Artistic', A: data.artistic, fullMark: 5 },
    { subject: 'Social', A: data.social, fullMark: 5 },
    { subject: 'Enterprising', A: data.enterprising, fullMark: 5 },
    { subject: 'Conventional', A: data.conventional, fullMark: 5 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            name="Interest Level"
            dataKey="A"
            stroke="#d97706"
            strokeWidth={3}
            fill="#fbbf24"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
