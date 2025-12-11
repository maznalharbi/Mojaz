import React, { useState, useEffect } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { Objection, getPriorityColor, getPriorityTextColor } from '../data/mockData';
import '../styles/ObjectionsTable.css';

interface ObjectionsTableProps {
  objections: Objection[];
  onSelectObjection: (objection: Objection) => void;
  showSortButton?: boolean; // إظهار زر موجز+ أو لا
  onAutoReject?: (objectionIds: string[]) => void; // دالة لرفض الاعتراضات تلقائياً
  tableTitle?: string; // عنوان الجدول
  showResolutionFilter?: boolean; // إظهار فلتر النتيجة
  resolutionFilter?: 'all' | 'approved' | 'rejected'; // قيمة الفلتر الحالية
  onResolutionFilterChange?: (filter: 'all' | 'approved' | 'rejected') => void; // دالة تغيير الفلتر
}

export const ObjectionsTable: React.FC<ObjectionsTableProps> = ({
  objections,
  onSelectObjection,
  showSortButton = true, // افتراضياً يظهر الزر
  onAutoReject,
  tableTitle = 'جدول الاعتراضات', // العنوان الافتراضي
  showResolutionFilter = false,
  resolutionFilter = 'all',
  onResolutionFilterChange,
}) => {
  const [sortedObjections, setSortedObjections] = useState(objections);
  const [isSorted, setIsSorted] = useState(false);
  const [sortingRows, setSortingRows] = useState<Set<string>>(new Set());
  const [isAutoRejecting, setIsAutoRejecting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ count: 0, duration: 0 });

  // تحديث البيانات عند تغيير objections من props
  useEffect(() => {
    if (isSorted) {
      // إذا كان مفروز، نحافظ على الفرز مع البيانات الجديدة
      const sorted = [...objections].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      setSortedObjections(sorted);
    } else {
      // إذا لم يكن مفروز، نستخدم البيانات كما هي
      setSortedObjections(objections);
    }
  }, [objections, isSorted]);

  const handleSort = () => {
    if (!isSorted) {
      const sorted = [...sortedObjections].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      // تفعيل حركة الموجة للسقوط
      const allIds = new Set(sorted.map(obj => obj.id));
      setSortingRows(allIds);
      setSortedObjections(sorted);
      setIsSorted(true);

      setTimeout(() => {
        setSortingRows(new Set());
      }, 700);
    } else {
      // العودة للترتيب الأصلي
      const allIds = new Set(objections.map(obj => obj.id));
      setSortingRows(allIds);
      setSortedObjections(objections);
      setIsSorted(false);

      setTimeout(() => {
        setSortingRows(new Set());
      }, 1000);
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالي 🔴';
      case 'medium':
        return 'متوسط 🟡';
      case 'low':
        return 'منخفض 🟢';
      default:
        return priority;
    }
  };

  const handleAutoReject = () => {
    if (!onAutoReject) return;

    const startTime = Date.now();
    setIsAutoRejecting(true);

    // جمع كل الاعتراضات منخفضة الأولوية (الخضراء)
    const lowPriorityIds = sortedObjections
      .filter(obj => obj.priority === 'low' && obj.status !== 'resolved')
      .map(obj => obj.id);

    const count = lowPriorityIds.length;

    // استدعاء دالة الرفض التلقائي
    onAutoReject(lowPriorityIds);

    setTimeout(() => {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(1); // بالثواني

      setIsAutoRejecting(false);
      setNotificationData({ count, duration: parseFloat(duration) });
      setShowNotification(true);

      // إخفاء الإشعار بعد 4 ثواني
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
    }, 1000);
  };

  return (
    <div className="objections-table">
      {/* Header with Sort Button */}
      <div className="table-header">
        <h2>{tableTitle}</h2>
        <div className="header-buttons">
          {showResolutionFilter && onResolutionFilterChange && (
            <select
              value={resolutionFilter}
              onChange={(e) => onResolutionFilterChange(e.target.value as 'all' | 'approved' | 'rejected')}
              style={{
                padding: '10px 16px',
                backgroundColor: 'white',
                color: '#1b5e20',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: "'Droid Arabic Kufi', sans-serif",
                outline: 'none',
                marginLeft: '12px'
              }}
            >
              <option value="all">الكل</option>
              <option value="approved">✅ تم إسقاط المخالفة</option>
              <option value="rejected">❌ تم الرفض</option>
            </select>
          )}
          {isSorted && onAutoReject && (
            <button
              onClick={handleAutoReject}
              disabled={isAutoRejecting}
              className={`auto-reject-button ${isAutoRejecting ? 'rejecting' : ''}`}
            >
              <span>⚡</span>
              <span>{isAutoRejecting ? 'جاري الرفض...' : 'قرار تلقائي'}</span>
            </button>
          )}
          {showSortButton && (
            <button
              onClick={handleSort}
              className={`sort-button ${isSorted ? 'sorted' : ''}`}
            >
              <Zap size={20} />
              <span>موجّز+</span>
              {isSorted && <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>رقم الاعتراض</th>
              <th>اللوحة</th>
              <th>نوع المخالفة</th>
              <th>التاريخ والوقت</th>
              {isSorted && <th>الأولوية</th>}
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {sortedObjections.map((objection, idx) => (
              <tr
                key={objection.id}
                className={`table-row ${sortingRows.has(objection.id) ? 'sorting' : isSorted ? 'sorted' : ''}`}
                style={{
                  backgroundColor: isSorted ? getPriorityColor(objection.priority) : 'white',
                  animationDelay: `${(sortingRows.has(objection.id) || isSorted) ? idx * 40 : 0}ms`,
                }}
              >
                <td className="cell-number">{objection.caseNumber}</td>
                <td className="cell-plate">{objection.plateNumber}</td>
                <td className="cell-violation">{objection.violationType}</td>
                <td className="cell-time">{objection.registrationTime}</td>
                {isSorted && (
                  <td className="cell-priority">
                    <span
                      className="priority-badge"
                      style={{ color: getPriorityTextColor(objection.priority) }}
                    >
                      {getPriorityLabel(objection.priority)}
                    </span>
                  </td>
                )}
                <td className="cell-action">
                  {objection.status === 'resolved' ? (
                    <div className={`resolution-badge ${objection.resolution}`}>
                      {objection.resolution === 'approved' ? (
                        <>
                          <span className="resolution-icon">✅</span>
                          تم إسقاط المخالفة
                        </>
                      ) : (
                        <>
                          <span className="resolution-icon">❌</span>
                          رفض
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectObjection(objection)}
                      className="btn-details"
                    >
                      التفاصيل
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      <div className="table-footer">
        إجمالي الاعتراضات: <span className="count">{sortedObjections.length}</span>
      </div>

      {/* Success Notification */}
      {showNotification && (
        <div className="success-notification">
          <div className="notification-icon">✅</div>
          <div className="notification-content">
            <div className="notification-title">تم المعالجة بنجاح</div>
            <div className="notification-details">
              <span>عدد الاعتراضات: {notificationData.count}</span>
              <span className="notification-divider">•</span>
              <span>الوقت المستغرق: {notificationData.duration} ثانية</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
