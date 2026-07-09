import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { StatsCards } from '../components/StatsCards';
import { ObjectionsTable } from '../components/ObjectionsTable';
import { ObjectionDetails } from '../components/ObjectionDetails';
import { Objection, generateMockData } from '../data/mockData';
import { analyzeBatch } from '../services/aiAnalyzer';
import '../styles/EmployeePage.css';

interface EmployeePageProps {
  objections: Objection[];
  onLogout: () => void;
}

export const EmployeePage: React.FC<EmployeePageProps> = ({ objections, onLogout }) => {
  const [selectedObjection, setSelectedObjection] = useState<Objection | null>(null);
  const [sortedObjections, setSortedObjections] = useState<Objection[]>(objections);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');
  const [resolutionFilter, setResolutionFilter] = useState<'all' | 'approved' | 'rejected'>('all');

  // تحديث البيانات عند تغيير objections من props
  useEffect(() => {
    setSortedObjections(objections);
  }, [objections]);

  const handleMojazPlus = async () => {
    setIsAnalyzing(true);

    try {
      // تحضير البيانات للتحليل
      const objectionsData = sortedObjections.map((obj) => ({
        id: obj.id,
        text: obj.description,
        violationType: obj.violationType,
      }));

      // تحليل كل الاعتراضات بالـ AI
      const analysisResults = await analyzeBatch(objectionsData);

      // تحديث الأولويات بناءً على نتائج التحليل
      const updated = sortedObjections.map((obj) => {
        const analysis = analysisResults.get(obj.id);
        if (analysis) {
          return {
            ...obj,
            priority: analysis.priority,
          };
        }
        return obj;
      });

      // ترتيب حسب الأولوية: high → medium → low
      const sorted = [...updated].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setSortedObjections(sorted);
      setIsAnalyzed(true);
    } catch (error) {
      console.error('خطأ في تحليل الاعتراضات:', error);
      alert('حدث خطأ أثناء التحليل. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResolveObjection = (objectionId: string, resolution: 'approved' | 'rejected') => {
    const updated = sortedObjections.map((obj) =>
      obj.id === objectionId
        ? { ...obj, status: 'resolved' as const, resolution }
        : obj
    );
    setSortedObjections(updated);
  };

  const handleAutoReject = (objectionIds: string[]) => {
    const updated = sortedObjections.map((obj) =>
      objectionIds.includes(obj.id)
        ? { ...obj, status: 'resolved' as const, resolution: 'rejected' as const }
        : obj
    );
    setSortedObjections(updated);
  };

  const handleReloadData = () => {
    const message = sortedObjections.length > 0
      ? 'هل تريد إعادة تحميل بيانات وهمية جديدة؟ سيتم مسح جميع البيانات الحالية.'
      : 'هل تريد تحميل بيانات وهمية؟';

    if (window.confirm(message)) {
      const newData = generateMockData();
      localStorage.setItem('mojaz_objections', JSON.stringify(newData));
      window.location.reload();
    }
  };

  const handleClearData = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات؟ سيتم إعادة تحميل الصفحة.')) {
      localStorage.removeItem('mojaz_objections');
      window.location.reload();
    }
  };

  if (selectedObjection) {
    return (
      <ObjectionDetails
        objection={selectedObjection}
        onBack={() => setSelectedObjection(null)}
        onResolve={handleResolveObjection}
      />
    );
  }

  return (
    <div className="employee-page">
      <Header userName="  مازن عماد الحربي" onLogout={onLogout} />

      <main className="main-content">
        <div className="container-custom">
          {/* أزرار إدارة البيانات */}
          <div style={{ marginBottom: '20px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleReloadData}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🔄 توليد بيانات للتجربة
            </button>

            <button
              onClick={handleClearData}
              style={{
                padding: '10px 20px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🗑️ حذف جميع البيانات
            </button>
          </div>

          {sortedObjections.length > 0 ? (
            <>
              <StatsCards objections={sortedObjections} />

              {/* التبويبات */}
              <div className="tabs-container">
                <button
                  className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                >
                  
 
 
                 اعتراضات بانتظار المعاينة
                 <span className="tab-icon">⏳</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === 'processed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('processed')}
                >
                  اعتراضات تمت معالجتها
                  <span className="tab-icon">✅</span>

                </button>
              </div>

              {/* محتوى التبويبات */}
              {activeTab === 'pending' ? (
                <ObjectionsTable
                  key="pending-table"
                  objections={sortedObjections.filter(obj => obj.status !== 'resolved')}
                  onSelectObjection={setSelectedObjection}
                  showSortButton={true}
                  onAutoReject={handleAutoReject}
                  tableTitle="اعتراضات بانتظار المعاينة"
                />
              ) : (
                <ObjectionsTable
                  key="resolved-table"
                  objections={sortedObjections.filter(obj => {
                    if (obj.status !== 'resolved') return false;
                    if (resolutionFilter === 'all') return true;
                    return obj.resolution === resolutionFilter;
                  })}
                  onSelectObjection={setSelectedObjection}
                  showSortButton={false}
                  tableTitle="اعتراضات تمت معالجتها"
                  showResolutionFilter={true}
                  resolutionFilter={resolutionFilter}
                  onResolutionFilterChange={setResolutionFilter}
                />
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h2>لا توجد اعتراضات</h2>
              <p>لم يتم تسجيل أي اعتراضات من المواطنين بعد</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
