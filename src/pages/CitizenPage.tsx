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
  const [imageAnalysisResult, setImageAnalysisResult] = useState<string>('');
  const [textAnalysisStatus, setTextAnalysisStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [imageAnalysisStatus, setImageAnalysisStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');

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
    setTextAnalysisStatus('idle');
    setImageAnalysisStatus('idle');

    try {
      setTextAnalysisStatus('analyzing');
      await new Promise(resolve => setTimeout(resolve, 800));

      const analysis = await analyzeObjectionWithAI(objectionText, violationType, images);

      setTextAnalysisStatus('done');
      await new Promise(resolve => setTimeout(resolve, 300));

      if (images.length > 0) {
        setImageAnalysisStatus('analyzing');
        await new Promise(resolve => setTimeout(resolve, 600));

        if (analysis.imageAnalysis) {
          setImageAnalysisResult(
            `${analysis.imageAnalysis.reasoning} (+${analysis.imageAnalysis.bonusScore} نقطة)`
          );
        }

        setImageAnalysisStatus('done');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
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
        status: 'pending',
      };

      onSubmitObjection(newObjection);
      setSuccess(true);

      setTimeout(() => {
        setObjectionText('');
        setImages([]);
        setSuccess(false);
        setImageAnalysisResult('');
        setTextAnalysisStatus('idle');
        setImageAnalysisStatus('idle');
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

            {(textAnalysisStatus !== 'idle' || imageAnalysisStatus !== 'idle') && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(13, 71, 32, 0.98) 0%, rgba(26, 92, 46, 0.98) 50%, rgba(13, 71, 32, 0.98) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                animation: 'overlayFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(25px)',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.06) 0%, transparent 60%)',
                  animation: 'subtleGlow 3s ease-in-out infinite alternate'
                }} />

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: images.length > 0 ? '1fr 1fr' : '1fr',
                  gap: '35px',
                  maxWidth: '950px',
                  width: '92%',
                  position: 'relative',
                  zIndex: 2,
                  animation: 'cardsEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                <div style={{
                  background: textAnalysisStatus === 'analyzing'
                    ? 'linear-gradient(145deg, #ffffff 0%, #fffef8 100%)'
                    : textAnalysisStatus === 'done'
                    ? 'linear-gradient(145deg, #ffffff 0%, #f1f8e9 100%)'
                    : 'linear-gradient(145deg, #ffffff, #fafafa)',
                  border: textAnalysisStatus === 'analyzing'
                    ? '3px solid #d4af37'
                    : textAnalysisStatus === 'done'
                    ? '3px solid #4caf50'
                    : '3px solid #e0e0e0',
                  padding: '60px 40px',
                  borderRadius: '28px',
                  textAlign: 'center',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: textAnalysisStatus === 'analyzing'
                    ? '0 30px 90px rgba(212, 175, 55, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                    : textAnalysisStatus === 'done'
                    ? '0 30px 90px rgba(76, 175, 80, 0.4), 0 0 0 1px rgba(76, 175, 80, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                    : '0 20px 60px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  overflow: 'visible',
                  transform: textAnalysisStatus === 'analyzing'
                    ? 'translateY(-8px) scale(1.03)'
                    : textAnalysisStatus === 'done'
                    ? 'scale(1)'
                    : 'translateY(0) scale(1)',
                }}>
                  <div style={{
                    fontSize: '90px',
                    marginBottom: '24px',
                    position: 'relative',
                    filter: textAnalysisStatus === 'analyzing'
                      ? 'drop-shadow(0 10px 30px rgba(212, 175, 55, 0.5))'
                      : textAnalysisStatus === 'done'
                      ? 'drop-shadow(0 10px 30px rgba(76, 175, 80, 0.5))'
                      : 'none',
                    animation: textAnalysisStatus === 'analyzing'
                      ? 'gentleBounce 1.5s ease-in-out infinite'
                      : textAnalysisStatus === 'done'
                      ? 'successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      : 'none',
                  }}>
                    {textAnalysisStatus === 'analyzing' ? '🔍' : textAnalysisStatus === 'done' ? '✅' : '📝'}
                  </div>

                  <p style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: '800',
                    color: textAnalysisStatus === 'analyzing'
                      ? '#d4af37'
                      : textAnalysisStatus === 'done'
                      ? '#2e7d32'
                      : '#333',
                    letterSpacing: '0.5px',
                  }}>
                    {textAnalysisStatus === 'analyzing' ? 'جاري تحليل النص...' : textAnalysisStatus === 'done' ? '✨ تم تحليل النص بنجاح' : 'تحليل النص'}
                  </p>

                  {textAnalysisStatus === 'analyzing' && (
                    <div style={{
                      marginTop: '28px',
                      width: '100%',
                      height: '5px',
                      background: 'rgba(212, 175, 55, 0.2)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        height: '100%',
                        width: '60%',
                        background: 'linear-gradient(90deg, #d4af37, #f4d03f)',
                        borderRadius: '10px',
                        animation: 'smoothProgress 1.8s ease-in-out infinite',
                        boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)'
                      }} />
                    </div>
                  )}
                </div>

                {images.length > 0 && (
                  <div style={{
                    background: imageAnalysisStatus === 'analyzing'
                      ? 'linear-gradient(145deg, #ffffff 0%, #fffef8 100%)'
                      : imageAnalysisStatus === 'done'
                      ? 'linear-gradient(145deg, #ffffff 0%, #f1f8e9 100%)'
                      : 'linear-gradient(145deg, #ffffff, #fafafa)',
                    border: imageAnalysisStatus === 'analyzing'
                      ? '3px solid #d4af37'
                      : imageAnalysisStatus === 'done'
                      ? '3px solid #4caf50'
                      : '3px solid #e0e0e0',
                    padding: '60px 40px',
                    borderRadius: '28px',
                    textAlign: 'center',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: imageAnalysisStatus === 'analyzing'
                      ? '0 30px 90px rgba(212, 175, 55, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                      : imageAnalysisStatus === 'done'
                      ? '0 30px 90px rgba(76, 175, 80, 0.4), 0 0 0 1px rgba(76, 175, 80, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                      : '0 20px 60px rgba(0, 0, 0, 0.15)',
                    position: 'relative',
                    overflow: 'visible',
                    transform: imageAnalysisStatus === 'analyzing'
                      ? 'translateY(-8px) scale(1.03)'
                      : imageAnalysisStatus === 'done'
                      ? 'scale(1)'
                      : 'translateY(0) scale(1)',
                  }}>
                    <div style={{
                      fontSize: '90px',
                      marginBottom: '24px',
                      position: 'relative',
                      filter: imageAnalysisStatus === 'analyzing'
                        ? 'drop-shadow(0 10px 30px rgba(212, 175, 55, 0.5))'
                        : imageAnalysisStatus === 'done'
                        ? 'drop-shadow(0 10px 30px rgba(76, 175, 80, 0.5))'
                        : 'none',
                      animation: imageAnalysisStatus === 'analyzing'
                        ? 'gentleBounce 1.5s ease-in-out infinite'
                        : imageAnalysisStatus === 'done'
                        ? 'successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        : 'none',
                    }}>
                      {imageAnalysisStatus === 'analyzing' ? '📸' : imageAnalysisStatus === 'done' ? '✅' : '🖼️'}
                    </div>

                    <p style={{
                      margin: 0,
                      fontSize: '22px',
                      fontWeight: '800',
                      color: imageAnalysisStatus === 'analyzing'
                        ? '#d4af37'
                        : imageAnalysisStatus === 'done'
                        ? '#2e7d32'
                        : '#333',
                      letterSpacing: '0.5px',
                    }}>
                      {imageAnalysisStatus === 'analyzing' ? 'جاري تحليل الصورة...' : imageAnalysisStatus === 'done' ? '✨ تم تحليل الصورة بنجاح' : 'تحليل الصورة'}
                    </p>

                    {imageAnalysisStatus === 'analyzing' && (
                      <div style={{
                        marginTop: '28px',
                        width: '100%',
                        height: '5px',
                        background: 'rgba(212, 175, 55, 0.2)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{
                          height: '100%',
                          width: '60%',
                          background: 'linear-gradient(90deg, #d4af37, #f4d03f)',
                          borderRadius: '10px',
                          animation: 'smoothProgress 1.8s ease-in-out infinite',
                          boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)'
                        }} />
                      </div>
                    )}

                    {imageAnalysisStatus === 'done' && imageAnalysisResult && (
                      <div style={{
                        marginTop: '28px',
                        padding: '20px 24px',
                        background: 'linear-gradient(145deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
                        borderRadius: '18px',
                        border: '2px solid rgba(76, 175, 80, 0.25)',
                        animation: 'resultFadeIn 0.5s ease-out',
                        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.15)',
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '16px',
                          color: '#2e7d32',
                          fontWeight: '700',
                          lineHeight: '1.7'
                        }}>
                          {imageAnalysisResult}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                </div>

                <style>{`
                  @keyframes overlayFadeIn {
                    from {
                      opacity: 0;
                      backdrop-filter: blur(0px);
                    }
                    to {
                      opacity: 1;
                      backdrop-filter: blur(25px);
                    }
                  }

                  @keyframes subtleGlow {
                    from {
                      opacity: 0.3;
                      transform: scale(1);
                    }
                    to {
                      opacity: 0.5;
                      transform: scale(1.05);
                    }
                  }

                  @keyframes cardsEntrance {
                    from {
                      opacity: 0;
                      transform: translateY(30px) scale(0.95);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0) scale(1);
                    }
                  }

                  @keyframes gentleBounce {
                    0%, 100% {
                      transform: translateY(0) scale(1);
                    }
                    50% {
                      transform: translateY(-10px) scale(1.05);
                    }
                  }

                  @keyframes successPop {
                    0% {
                      transform: scale(0.8);
                      opacity: 0;
                    }
                    50% {
                      transform: scale(1.15);
                    }
                    100% {
                      transform: scale(1);
                      opacity: 1;
                    }
                  }

                  @keyframes smoothProgress {
                    0% {
                      transform: translateX(-100%);
                    }
                    50% {
                      transform: translateX(40%);
                    }
                    100% {
                      transform: translateX(-100%);
                    }
                  }

                  @keyframes resultFadeIn {
                    from {
                      opacity: 0;
                      transform: translateY(10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>
              </div>
            )}

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
              {loading ? '⏳ جاري المعالجة...' : ' إرسال الاعتراض 📤'}
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
