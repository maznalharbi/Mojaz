import React from 'react';
import '../styles/RoleSelection.css';

interface RoleSelectionProps {
  onSelectRole: (role: 'employee' | 'citizen') => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  const handleClearData = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات؟ سيتم إعادة تحميل الصفحة.')) {
      localStorage.removeItem('mojaz_objections');
      // إعادة تحميل فورية بدون alert لتجنب مشاكل التوقيت
      window.location.reload();
    }
  };

  return (
    <div className="role-selection-page">
      <div className="role-container">
        <div className="logo-section">
          <h1 className="app-title">مـوجّــز +</h1>
          <p className="app-subtitle">نظام ذكي لإدارة اعتراضات المخالفات المرورية</p>
        </div>

        <div className="role-cards">
          <div
            className="role-card employee-card"
            onClick={() => onSelectRole('employee')}
          >
            <div className="role-icon">👨‍💼</div>
            <h2>موظف أبشر</h2>
            <p>إدارة ومراجعة الاعتراضات</p>
            <div className="role-features">
              <span>✓ عرض جميع الاعتراضات</span>
              <span>✓ تحليل ذكي بالـ AI</span>
              <span>✓ ترتيب تلقائي</span>
            </div>
          </div>

          <div
            className="role-card citizen-card"
            onClick={() => onSelectRole('citizen')}
          >
            <div className="role-icon">👤</div>
            <h2>مواطن</h2>
            <p>رفع اعتراض جديد على مخالفة</p>
            <div className="role-features">
              <span>✓ رفع اعتراض جديد</span>
              <span>✓ إرفاق الأدلة</span>
              <span>✓ متابعة الحالة</span>
            </div>
          </div>
        </div>

        <div className="footer-info">
          <p> تم تطويره بواسطة فريق صفّ  </p>
          <p> مدعوم بالذكاء الاصطناعي 🤖 </p>
          
          <button
            onClick={handleClearData}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
             حذف جميع البيانات 🗑️ (للاختبار)
          </button>
        </div>
      </div>
    </div>
  );
};
