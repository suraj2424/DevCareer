import React from 'react';
import { Card, CardContent } from './ui/Card';

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  return (
    <Card padding="md">
      <CardContent>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="flex items-end justify-between mt-2">
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          <div className={`w-8 h-1 ${color} mb-2 rounded-full`}></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
