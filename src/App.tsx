import { useState, useEffect } from 'react';
import './App.css';
import './styles/global.css';
import { RoleSelection } from './pages/RoleSelection';
import { EmployeePage } from './pages/EmployeePage';
import { CitizenPage } from './pages/CitizenPage';
import { Objection, generateMockData } from './data/mockData';

type UserRole = 'employee' | 'citizen' | null;

const STORAGE_KEY = 'mojaz_objections';

// دالة مساعدة لتحميل البيانات من localStorage
const loadObjectionsFromStorage = (): Objection[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((obj: any) => ({
        ...obj,
        timestamp: new Date(obj.timestamp),
      }));
    }
  } catch (error) {
    console.error('خطأ في تحميل البيانات:', error);
  }
  // إرجاع مصفوفة فارغة بدلاً من توليد بيانات تلقائياً
  return [];
};

function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [objections, setObjections] = useState<Objection[]>(loadObjectionsFromStorage);

  // حفظ الاعتراضات في localStorage عند كل تغيير
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(objections));
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
    }
  }, [objections]);

  const handleSelectRole = (role: 'employee' | 'citizen') => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
    // لا نحذف الاعتراضات عند تسجيل الخروج
  };

  const handleSubmitObjection = (objection: Objection) => {
    setObjections((prev) => [objection, ...prev]);
  };

  // شاشة اختيار الدور
  if (!userRole) {
    return <RoleSelection onSelectRole={handleSelectRole} />;
  }

  // واجهة الموظف
  if (userRole === 'employee') {
    return <EmployeePage objections={objections} onLogout={handleLogout} />;
  }

  // واجهة المواطن
  return (
    <CitizenPage
      onSubmitObjection={handleSubmitObjection}
      onBack={handleLogout}
    />
  );
}

export default App;
