import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, FileText } from 'lucide-react';
import { Objection } from '../data/mockData';
import '../styles/StatsCards.css';

interface StatsCardsProps {
  objections: Objection[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ objections }) => {
  const totalToday = objections.filter((obj) => {
    const today = new Date();
    const objDate = new Date(obj.timestamp);
    return objDate.toDateString() === today.toDateString();
  }).length;

  const highPriority = objections.filter((obj) => obj.priority === 'high').length;

  // حساب عدد الاعتراضات المعالجة والنسبة المئوية
  const resolvedCount = objections.filter((obj) => obj.status === 'resolved').length;
  const totalCount = objections.length;
  const completionPercentage = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Animation للنسبة المئوية
  const [animatedPercentage, setAnimatedPercentage] = useState(completionPercentage);

  useEffect(() => {
    // إذا كانت النسبة الجديدة مختلفة، نبدأ الأنيميشن
    if (animatedPercentage !== completionPercentage) {
      const increment = completionPercentage > animatedPercentage ? 1 : -1;
      const duration = 1000; // مدة الأنيميشن بالميلي ثانية
      const steps = Math.abs(completionPercentage - animatedPercentage);
      const stepDuration = duration / steps;

      let current = animatedPercentage;
      const timer = setInterval(() => {
        current += increment;
        setAnimatedPercentage(current);

        if (current === completionPercentage) {
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [completionPercentage]);

  const stats = [
    {
      title: 'إجمالي الاعتراضات',
      value: objections.length,
      icon: FileText,
      bgColor: '#fff3e0',
      textColor: '#e65100',
      borderColor: '#ff9800',
    },
    {
      title: 'عالية الأولوية',
      value: highPriority,
      icon: AlertCircle,
      bgColor: '#ffebee',
      textColor: '#c62828',
      borderColor: '#ef5350',
    },
    {
      title: 'نسبة الإنجاز',
      value: `${animatedPercentage}%`,
      icon: Clock,
      bgColor: '#e3f2fd',
      textColor: '#1565c0',
      borderColor: '#42a5f5',
    },
  ];

  return (
    <div className="stats-cards">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="stat-card"
            style={{
              backgroundColor: stat.bgColor,
              borderColor: stat.borderColor,
              animationDelay: `${idx * 100}ms`,
            }}
          >
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value" style={{ color: stat.textColor }}>
                {stat.value}
              </h3>
            </div>
            <div className="stat-icon" style={{ color: stat.textColor }}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
