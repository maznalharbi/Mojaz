import React, { useState } from 'react';
import { analyzeObjectionWithAI } from '../services/aiAnalyzer';
import { Objection } from '../data/mockData';
import { Chatbot } from '../components/Chatbot';
import '../styles/CitizenPage.css';

interface CitizenPageProps {
  onSubmitObjection: (objection: Objection) => void;
  onBack: () => void;
}

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

export const CitizenPage: React.FC<CitizenPageProps> = ({ onSubmitObjection, onBack }) => {
  const [violationType, setViolationType] = useState(violationTypes[0]);
  const [objectionText, setObjectionText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 3); // بحد أقصى 3 صور
      setImages([...images, ...newImages].slice(0, 3));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!objectionText.trim()) {
      setError('الرجاء كتابة نص الاعتراض');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // تحليل الاعتراض بالـ AI
      const analysis = await analyzeObjectionWithAI(objectionText, violationType, images.length);

      // إنشاء الاعتراض الجديد
      const newObjection: Objection = {
        id: `OBJ-${Date.now()}`,
        caseNumber: String(Date.now()).slice(-6),
        plateNumber: `${['ح', 'س', 'ع'][Math.floor(Math.random() * 3)]} ${['ح', 'س', 'ع'][Math.floor(Math.random() * 3)]} ${['ح', 'س', 'ع'][Math.floor(Math.random() * 3)]} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
        violationType: violationType,
        registrationTime: new Date().toLocaleString('ar-SA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        priority: analysis.priority,
        description: objectionText,
        evidence: images.map((img) => img.name),
        location: 'الرياض',
        timestamp: new Date(),
        status: 'pending', // الاعتراضات الجديدة تكون بانتظار المعاينة
      };

      onSubmitObjection(newObjection);
      setSuccess(true);

      // إعادة تعيين النموذج بعد 2 ثانية
      setTimeout(() => {
        setObjectionText('');
        setImages([]);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('حدث خطأ أثناء إرسال الاعتراض. الرجاء المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="citizen-page">
      <div className="citizen-header">
        <button onClick={onBack} className="btn btn-secondary">
          ← العودة
        </button>
        <h1>رفع اعتراض على مخالفة مرورية</h1>
      </div>

      {/* Chatbot */}
      <Chatbot />

      <div className="citizen-container">
        {success ? (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>تم إرسال الاعتراض بنجاح!</h2>
            <p>سيتم مراجعة اعتراضك من قبل الفريق المختص</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="objection-form">
            <div className="form-group">
              <label>نوع المخالفة *</label>
              <select
                value={violationType}
                onChange={(e) => setViolationType(e.target.value)}
                className="form-select"
                required
              >
                {violationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>نص الاعتراض *</label>
              <textarea
                value={objectionText}
                onChange={(e) => setObjectionText(e.target.value)}
                placeholder="اكتب اعتراضك هنا بالتفصيل..."
                className="form-textarea"
                rows={8}
                required
              />
              <div className="char-count">
                {objectionText.length} حرف
              </div>
            </div>

            <div className="form-group">
              <label>الأدلة والمستندات (اختياري)</label>
              <div className="upload-section">
                <label className="upload-btn">
                   إرفاق صورة 📎
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <span className="upload-hint">يمكنك إرفاق حتى 3 صور</span>
              </div>

              {images.length > 0 && (
                <div className="images-preview">
                  {images.map((img, index) => (
                    <div key={index} className="image-item">
                      <span>📄 {img.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary submit-btn"
            >
              {loading ? '⏳ جاري إرسال الاعتراض...' : ' إرسال الاعتراض 📤'}
            </button>

            <div className="info-box">
              <p> نصيحة: اكتب اعتراضك بوضوح وأرفق الأدلة الداعمة لزيادة فرص قبولة 💡</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
