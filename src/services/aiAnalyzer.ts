/**
 * خدمة تحليل الاعتراضات باستخدام Google Gemini AI
 * تحلل نص الاعتراض وتحدد القوة والأولوية
 */

export interface AIAnalysisResult {
  priority: 'high' | 'medium' | 'low';
  hasEvidence: boolean;
  reasoning: string;
  confidence: number;
}

const GEMINI_ENDPOINT = '/api/analyze'; // سنربطه بـ Serverless Function

/**
 * تحليل نص الاعتراض باستخدام AI
 */
export async function analyzeObjectionWithAI(
  objectionText: string,
  violationType: string,
  attachmentsCount: number = 0
): Promise<AIAnalysisResult> {
  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: objectionText,
        violationType: violationType,
        attachmentsCount: attachmentsCount,
      }),
    });

    if (!response.ok) {
      throw new Error('فشل التحليل');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('خطأ في تحليل AI:', error);
    // Fallback للتحليل المحلي
    return analyzeFallback(objectionText, attachmentsCount);
  }
}

/**
 * تحليل احتياطي محلي (بدون AI)
 * يستخدم في حالة فشل الاتصال بـ API
 */
function analyzeFallback(text: string, attachmentsCount: number = 0): AIAnalysisResult {
  const lowerText = text.toLowerCase();

  // كشف الأدلة
  const evidenceKeywords = [
    'صورة', 'صور', 'إيصال', 'مرفق', 'وثيقة',
    'ورقة', 'فحص', 'استمارة', 'عقد', 'تقرير'
  ];

  const hasEvidenceInText = evidenceKeywords.some(keyword => lowerText.includes(keyword));
  const hasAttachments = attachmentsCount > 0;
  const hasEvidence = hasEvidenceInText || hasAttachments;

  // كشف الحجج القوية
  const strongArguments = [
    'خطأ', 'خاطئ', 'لوحة', 'دفعت', 'ورشة',
    'عطل', 'معطلة', 'رادار', 'كاميرا'
  ];

  const hasStrongArgument = strongArguments.some(keyword => lowerText.includes(keyword));

  // كشف الاعتذارات الضعيفة
  const weakPhrases = [
    'آسف', 'أعتذر', 'مستعجل', 'متعب', 'مشتت',
    'نسيت', 'لم أركز', 'ضغط نفسي'
  ];

  const isWeak = weakPhrases.some(phrase => lowerText.includes(phrase));

  // تحديد الأولوية
  let priority: 'high' | 'medium' | 'low';
  let confidence: number;
  let reasoning: string;

  if (hasEvidence && hasStrongArgument) {
    priority = 'high';
    confidence = 0.85;
    reasoning = 'اعتراض قوي: يحتوي على أدلة وحجج منطقية';
  } else if (hasStrongArgument || hasEvidence) {
    priority = 'medium';
    confidence = 0.7;
    reasoning = 'اعتراض متوسط: يحتوي على بعض الحجج أو الأدلة';
  } else {
    priority = 'low';
    confidence = 0.6;
    reasoning = 'اعتراض ضعيف: اعتذار بدون أدلة قوية';
  }

  return {
    priority,
    hasEvidence,
    reasoning,
    confidence,
  };
}

/**
 * تحليل دفعة من الاعتراضات
 */
export async function analyzeBatch(objections: Array<{
  text: string;
  violationType: string;
  id: string;
  attachmentsCount?: number;
}>): Promise<Map<string, AIAnalysisResult>> {
  const results = new Map<string, AIAnalysisResult>();

  // تحليل بالتوازي (بحد أقصى 5 في نفس الوقت)
  const batchSize = 5;
  for (let i = 0; i < objections.length; i += batchSize) {
    const batch = objections.slice(i, i + batchSize);
    const promises = batch.map(async (obj) => {
      const result = await analyzeObjectionWithAI(obj.text, obj.violationType, obj.attachmentsCount || 0);
      return { id: obj.id, result };
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ id, result }) => {
      results.set(id, result);
    });
  }

  return results;
}
