import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent } from './ui/Card';

interface ChartData {
  name: string;
  value: number;
}

interface ChartContainerProps {
  data: ChartData[];
  title: string;
  colors?: string[];
}

const DEFAULT_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#a855f7', '#94a3b8'];

const ChartContainer: React.FC<ChartContainerProps> = ({ 
  data, 
  title, 
  colors = DEFAULT_COLORS 
}) => {
  return (
    <Card padding="lg">
      <CardContent>
        <h3 className="text-lg font-bold mb-6">{title}</h3>
        <div className="w-full h-[300px] min-h-[300px] min-w-0" role="img" aria-label={`Bar chart showing ${title.toLowerCase()}`}>
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '2px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartContainer;
