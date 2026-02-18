import React from 'react';
import { Application, Company } from '../types';
import { Card, CardContent, CardFooter } from './ui/Card';
import Button from './ui/Button';

interface ActivityListProps {
  applications: Application[];
  companies: Company[];
  onViewAll: () => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ applications, companies, onViewAll }) => {
  const recentApplications = applications.slice(-5).reverse();

  return (
    <Card padding="md" className="overflow-hidden flex flex-col">
      <CardContent className="flex-1 overflow-hidden">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-[300px]">
          {recentApplications.map((app) => {
            const company = companies.find(c => c.id === app.companyId);
            return (
              <div key={app.id} className="flex gap-4 pb-4 border-b border-slate-50 last:border-0">
                <div className="w-10 h-10 shrink-0 bg-slate-100 flex items-center justify-center font-bold text-slate-400 rounded-sm" aria-hidden="true">
                  {company?.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{app.position}</p>
                  <p className="text-xs text-slate-500">{company?.name} • {app.status}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{app.dateApplied}</p>
                </div>
              </div>
            );
          })}
          {applications.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No applications yet.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-0 pt-4">
        <Button 
          variant="ghost" 
          className="w-full justify-center"
          onClick={onViewAll}
        >
          View All Applications
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActivityList;
