/**
 * خدمة تحليل الاعتراضات باستخدام Google Gemini AI
 * تحلل نص الاعتراض وتحدد القوة والأولوية
 */

export interface AIAnalysisResult {
  priority: 'high' | 'medium' | 'low';
  hasEvidence: boolean;
  reasoning: string;
  confidence: number;
  imageAnalysis?: ImageAnalysisResult;
}

export interface ImageAnalysisResult {
  bonusScore: number;
  matchQuality: 'high' | 'medium' | 'low';
  hasEvidence: boolean;
  reasoning: string;
  details: string;
}

const GEMINI_ENDPOINT = '/api/analyze'; // سنربطه بـ Serverless Function
const GEMINI_IMAGE_ENDPOINT = '/api/analyzeImage'; // تحليل الصور

/**
 * تحليل نص الاعتراض باستخدام AI
 */
export async function analyzeObjectionWithAI(
  objectionText: string,
  violationType: string,
  attachmentsCount: number = 0,
  images?: File[]
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

    const result: AIAnalysisResult = await response.json();

    if (images && images.length > 0) {
      try {
        const imageAnalysisResults = await analyzeImages(images, violationType, objectionText);
        result.imageAnalysis = imageAnalysisResults;

        if (imageAnalysisResults.bonusScore >= 20) {
          if (result.priority === 'medium') result.priority = 'high';
          if (result.priority === 'low') result.priority = 'medium';
        }
      } catch (imageError) {
        console.error('خطأ في تحليل الصور:', imageError);
      }
    }

    return result;
  } catch (error) {
    console.error('خطأ في تحليل AI:', error);
    return analyzeFallback(objectionText, attachmentsCount);
  }
}

async function analyzeImages(
  images: File[],
  violationType: string,
  objectionText: string
): Promise<ImageAnalysisResult> {
  const firstImage = images[0];
  const base64Image = await convertImageToBase64(firstImage);

  const response = await fetch(GEMINI_IMAGE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
      violationType: violationType,
      objectionText: objectionText,
    }),
  });

  if (!response.ok) {
    throw new Error('فشل تحليل الصورة');
  }

  const result: ImageAnalysisResult = await response.json();
  return result;
}

function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function analyzeFallback(text: string, attachmentsCount: number = 0): AIAnalysisResult {
  const lowerText = text.toLowerCase();

  const evidenceKeywords = [
    'صورة', 'صور', 'إيصال', 'مرفق', 'وثيقة',
    'ورقة', 'فحص', 'استمارة', 'عقد', 'تقرير'
  ];

  const hasEvidenceInText = evidenceKeywords.some(keyword => lowerText.includes(keyword));
  const hasAttachments = attachmentsCount > 0;
  const hasEvidence = hasEvidenceInText || hasAttachments;

  const strongArguments = [
    'خطأ', 'خاطئ', 'لوحة', 'دفعت', 'ورشة',
    'عطل', 'معطلة', 'رادار', 'كاميرا'
  ];

  const hasStrongArgument = strongArguments.some(keyword => lowerText.includes(keyword));

  const weakPhrases = [
    'آسف', 'أعتذر', 'مستعجل', 'متعب', 'مشتت',
    'نسيت', 'لم أركز', 'ضغط نفسي'
  ];

  const isWeak = weakPhrases.some(phrase => lowerText.includes(phrase));

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

export async function analyzeBatch(objections: Array<{
  text: string;
  violationType: string;
  id: string;
  attachmentsCount?: number;
}>): Promise<Map<string, AIAnalysisResult>> {
  const results = new Map<string, AIAnalysisResult>();

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
