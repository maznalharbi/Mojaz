import React, { useState } from 'react';
import { ArrowRight, FileText, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Objection, generateSummary, getPriorityTextColor } from '../data/mockData';
import '../styles/ObjectionDetails.css';

interface ObjectionDetailsProps {
  objection: Objection;
  onBack: () => void;
  onResolve?: (objectionId: string, resolution: 'approved' | 'rejected') => void;
}

export const ObjectionDetails: React.FC<ObjectionDetailsProps> = ({
  objection,
  onBack,
  onResolve,
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showDecisionConfirm, setShowDecisionConfirm] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<'approved' | 'rejected' | null>(null);

  const handleGenerateSummary = () => {
    setIsLoadingSummary(true);
    setTimeout(() => {
      setIsLoadingSummary(false);
      setShowSummary(true);
    }, 1500);
  };

  const handleDecisionClick = (decision: 'approved' | 'rejected') => {
    setSelectedDecision(decision);
    setShowDecisionConfirm(true);
  };

  const handleConfirmDecision = () => {
    if (selectedDecision && onResolve) {
      onResolve(objection.id, selectedDecision);
      setShowDecisionConfirm(false);
      onBack();
    }
  };

  const handleCancelDecision = () => {
    setShowDecisionConfirm(false);
    setSelectedDecision(null);
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ffebee';
      case 'medium':
        return '#fff3e0';
      case 'low':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'أولوية عالية جداً';
      case 'medium':
        return 'أولوية متوسطة';
      case 'low':
        return 'أولوية منخفضة';
      default:
        return priority;
    }
  };

  return (
    <div className="objection-details-page">
      {/* Back Button */}
      <div className="details-header">
        <button onClick={onBack} className="back-button">
          <ArrowRight size={24} />
          <span>العودة إلى الجدول</span>
        </button>
      </div>

      <div className="details-container-wrapper">
        <div className="details-container">
          {/* Main Card */}
          <div className={`details-card ${showSummary ? 'slide-left' : ''}`}>
            {/* Header with Priority */}
          <div className="details-header-section" style={{ backgroundColor: getPriorityBgColor(objection.priority) }}>
            <div className="header-left">
              <h1 className="details-title">
               رقم الاعتراض {getPriorityEmoji(objection.priority)} : {objection.caseNumber}
              </h1>
              <p className="details-subtitle">{objection.violationType}</p>
            </div>
            <div
              className="priority-badge-large"
              style={{ color: getPriorityTextColor(objection.priority) }}
            >
              {getPriorityLabel(objection.priority)}
            </div>
          </div>

          {/* Information Grid */}
          <div className="info-grid">
            {/* Left Column */}
            <div className="info-column">
              <div className="info-item">
                <label> رقم اللوحة 🚗</label>
                <p>{objection.plateNumber}</p>
              </div>

              <div className="info-item">
                <label>
                  الموقع
                  <MapPin size={18} className="icon-inline" />
                </label>
                <p>{objection.location}</p>
              </div>

              <div className="info-item">
                <label>
                  تاريخ التسجيل
                  <Clock size={18} className="icon-inline" />
                </label>
                <p>{objection.registrationTime}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="info-column">
              <div className="info-item">
                <label>
                  نوع المخالفة
                  📋
                </label>
                <p>{objection.violationType}</p>
              </div>

              <div className="info-item">
                <label>
                  الأدلة المرفقة
                  <FileText size={18} className="icon-inline" />
                </label>
                <div className="evidence-list">
                  {objection.evidence.map((file, idx) => (
                    <span key={idx} className="evidence-tag">
                      📎 {file}
                    </span>
                  ))}
                </div>
              </div>

              <div className="info-item">
                <label>
                  حالة الاعتراض
                  <AlertCircle size={18} className="icon-inline" />
                </label>
                <span className="status-badge">قيد المراجعة</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="description-section">
            <h2>نص الاعتراض 📝</h2>
            <div className="description-box">
              <p>{objection.description}</p>
            </div>
          </div>

          </div>
        </div>

        {/* Right Sidebar - Button and Summary */}
        <div className="sidebar-right">
          {/* Smart Summary Button */}
          <div className="summary-button-section">
            <button
              onClick={handleGenerateSummary}
              disabled={isLoadingSummary}
              className={`btn-smart-summary ${isLoadingSummary ? 'loading' : ''} ${showSummary ? 'done' : ''}`}
            >
              {isLoadingSummary ? (
                <>
                  
                  جاري التلخيص الذكي...
                  <span className="spinner">⏳</span>
                </>
              ) : showSummary ? (
                <>
                  
                  تم التلخيص
                <span>✅</span>
                </>
              ) : (
                <>
                
                 مـوجّـــز + ✨
                </>
              )}
            </button>
          </div>

          {/* Summary Sidebar - Next to button */}
          {showSummary && (() => {
            const { summary, strength, strengthColor } = generateSummary(objection);
            return (
              <div className="summary-sidebar">
                <div className="summary-sidebar-content">
                  <h3>ملخص الاعتراض 📋</h3>
                  <div className="summary-item-box">
                    <p className="summary-reason">السبب: <span>{summary}</span></p>
                  </div>
                  <div className="summary-item-box">
                    <p className="summary-strength" style={{ color: strengthColor }}>
                      قوة الحجة: <span>{strength}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Decision Buttons - Show when onResolve is available */}
          {onResolve && (
            <div className="decision-section">
              <h3 className="decision-title">اتخاذ القرار</h3>
              <div className="decision-buttons">
                <button
                  onClick={() => handleDecisionClick('approved')}
                  className="btn-approve"
                >
                  <span className="btn-icon">✅</span>
                  إسقاط المخالفة
                </button>
                <button
                  onClick={() => handleDecisionClick('rejected')}
                  className="btn-reject"
                >
                  <span className="btn-icon">❌</span>
                  رفض الاعتراض
                </button>
              </div>
            </div>
          )}

          {/* Decision already made - Show result if already resolved */}
          {!onResolve && objection.status === 'resolved' && (
            <div className="decision-result">
              <h3 className="decision-title">القرار النهائي</h3>
              <div className={`result-badge ${objection.resolution}`}>
                {objection.resolution === 'approved' ? (
                  <>
                    <span className="result-icon">✅</span>
                    <span>تم إسقاط المخالفة</span>
                  </>
                ) : (
                  <>
                    <span className="result-icon">❌</span>
                    <span>تم رفض الاعتراض</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDecisionConfirm && (
        <div className="modal-overlay" onClick={handleCancelDecision}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">تأكيد القرار</h2>
            <p className="modal-message">
              {selectedDecision === 'approved'
                ? 'هل أنت متأكد من إسقاط المخالفة؟'
                : 'هل أنت متأكد من رفض الاعتراض؟'}
            </p>
            <div className="modal-buttons">
              <button onClick={handleConfirmDecision} className="btn-confirm">
                نعم، تأكيد
              </button>
              <button onClick={handleCancelDecision} className="btn-cancel">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
