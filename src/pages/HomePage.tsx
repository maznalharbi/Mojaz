import React from 'react';
import { Header } from '../components/Header';
import { StatsCards } from '../components/StatsCards';
import { ObjectionsTable } from '../components/ObjectionsTable';
import { Objection } from '../data/mockData';
import '../styles/HomePage.css';

interface HomePageProps {
  objections: Objection[];
  onSelectObjection: (objection: Objection) => void;
  onLogout: () => void;
  onShowAIDemo?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  objections,
  onSelectObjection,
  onLogout,
  onShowAIDemo,
}) => {
  return (
    <div className="home-page">
      <Header userName=" مازن عماد الحربي " onLogout={onLogout} />

      <main className="main-content">
        <div className="container-custom">
          {onShowAIDemo && (
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <button
                onClick={onShowAIDemo}
                className="btn btn-gradient"
                style={{ fontSize: '16px', padding: '12px 32px' }}
              >
                🤖 اختبار تحليل الذكاء الاصطناعي
              </button>
            </div>
          )}
          <StatsCards objections={objections} />
          <ObjectionsTable
            objections={objections}
            onSelectObjection={onSelectObjection}
          />
        </div>
      </main>
    </div>
  );
};
