import React, { useState } from 'react';
import { analyzeObjectionWithAI, AIAnalysisResult } from '../services/aiAnalyzer';

export const AIAnalysisDemo: React.FC = () => {
  const [text, setText] = useState('');
  const [violationType, setViolationType] = useState('تجاوز الحد الأقصى للسرعة');
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const violationTypes = [
    'تجاوز الحد الأقصى للسرعة',
    'عدم الالتزام بالإشارات',
    'وقوف غير منظم',
    'عدم ارتداء حزام الأمان',
    'تجاوز خطير',
    'عدم الالتزام بالمسافات الآمنة',
    'القيادة المتهورة',
    'استخدام الهاتف أثناء القيادة',
    'تجاهل لافتات التحذير',
  ];

  const sampleTexts = [
    'آسف جداً، كنت مستعجل جداً للذهاب للعمل في الصباح ولم أركز على السرعة بشكل كافي',
    'لوحة السيارة المسجلة في النظام خاطئة بالكامل، مرفق صورة واضحة جداً للوحة الصحيحة وصورة لاستمارتي',
    'المركبة كانت في ورشة إصلاح معتمدة وقت المخالفة المسجلة بالفعل، مرفق ورقة الفحص الرسمية',
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('الرجاء إدخال نص الاعتراض');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const analysisResult = await analyzeObjectionWithAI(text, violationType);
      setResult(analysisResult);
    } catch (err) {
      setError('حدث خطأ أثناء التحليل. الرجاء المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴 قوية جداً';
      case 'medium':
        return '🟡 متوسطة';
      case 'low':
        return '🟢 ضعيفة';
      default:
        return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#c62828';
      case 'medium':
        return '#e65100';
      case 'low':
        return '#2e7d32';
      default:
        return '#666';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '24px', color: '#1b5e20' }}>
          🤖 اختبار تحليل الاعتراضات بالذكاء الاصطناعي
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            نوع المخالفة
          </label>
          <select
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          >
            {violationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            نص الاعتراض
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أدخل نص الاعتراض هنا..."
            rows={5}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
            أمثلة سريعة:
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sampleTexts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setText(sample)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                مثال {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {loading ? '⏳ جاري التحليل...' : '🔍 تحليل الاعتراض'}
        </button>

        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {result && (
          <div
            className="card"
            style={{
              backgroundColor: '#f5f5f5',
              marginTop: '24px',
              animation: 'slideUp 0.4s ease-out',
            }}
          >
            <h3 style={{ marginBottom: '16px', color: '#333' }}>📊 نتيجة التحليل</h3>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>قوة الاعتراض:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: getPriorityColor(result.priority),
                    fontSize: '16px',
                  }}
                >
                  {getPriorityLabel(result.priority)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>يحتوي على أدلة:</span>
                <span style={{ fontWeight: 700, color: result.hasEvidence ? '#2e7d32' : '#c62828' }}>
                  {result.hasEvidence ? '✅ نعم' : '❌ لا'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>نسبة الثقة:</span>
                <span style={{ fontWeight: 700, color: '#1b5e20' }}>
                  {(result.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                borderRight: `4px solid ${getPriorityColor(result.priority)}`,
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '13px', color: '#666' }}>
                التحليل:
              </p>
              <p style={{ margin: 0, lineHeight: '1.6' }}>{result.reasoning}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
