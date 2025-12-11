/**
 * Vercel Serverless Function
 * تحلل الاعتراضات باستخدام Google Gemini API
 * API Key مخفي في المتغيرات البيئية - آمن 100%
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export default async function handler(req, res) {
  // السماح فقط لـ POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, violationType } = req.body;

  if (!text || !violationType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // التحقق من وجود API Key
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY غير موجود في المتغيرات البيئية');
    return res.status(500).json({ error: 'API Key not configured' });
  }

  try {
    // إعداد الـ Prompt للـ AI
    const prompt = `أنت خبير في تحليل اعتراضات المخالفات المرورية السعودية.
قم بتحليل الاعتراض التالي:

نوع المخالفة المسجلة: ${violationType}
نص الاعتراض: "${text}"

المطلوب:

الخطوة 1 - التحقق من التطابق:
هل نص الاعتراض يتحدث عن نفس نوع المخالفة المسجلة؟
- إذا كان الاعتراض يتحدث عن مخالفة مختلفة تماماً → أعطه سكور صفر (priority: "low", confidence: 0)
- مثال: المخالفة "تجاوز السرعة" لكن الاعتراض يتحدث عن "وقوف خاطئ" → سكور صفر

الخطوة 2 - تحليل القوة (إذا كان متطابق):
إذا كان الاعتراض متطابق مع نوع المخالفة، حدد قوته:
- high: يحتوي على أدلة قوية (صور، مستندات، إيصالات، أوراق رسمية) وحجج منطقية
- medium: يحتوي على حجج معقولة أو ظروف مخففة (عطل، طوارئ، خطأ في النظام)
- low: اعتذارات فقط بدون أدلة أو حجج (آسف، مستعجل، متعب، نسيت)

الخطوة 3 - الأدلة:
هل يذكر النص وجود أدلة مرفقة؟ (صورة، مستند، إيصال، ورقة)

أرجع النتيجة بصيغة JSON فقط بدون أي نص إضافي:
{
  "priority": "high|medium|low",
  "hasEvidence": true|false,
  "reasoning": "السبب بالعربية في جملة واحدة",
  "confidence": 0.95
}`;

    // إرسال الطلب لـ Google Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3, // دقة أعلى
          maxOutputTokens: 200,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();

    // استخراج النتيجة من response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini');
    }

    // تنظيف النص واستخراج JSON
    let cleanedText = generatedText.trim();

    // إزالة markdown code blocks إذا وجدت
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const result = JSON.parse(cleanedText);

    // التحقق من صحة النتيجة
    if (!result.priority || !['high', 'medium', 'low'].includes(result.priority)) {
      throw new Error('Invalid priority value');
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error analyzing objection:', error);

    // Fallback: تحليل بسيط محلي
    const fallbackResult = analyzeFallback(text);
    return res.status(200).json(fallbackResult);
  }
}

/**
 * تحليل احتياطي بسيط (بدون AI)
 */
function analyzeFallback(text) {
  const lowerText = text.toLowerCase();

  const evidenceKeywords = ['صورة', 'صور', 'إيصال', 'مرفق', 'وثيقة', 'ورقة', 'فحص', 'استمارة'];
  const strongKeywords = ['خطأ', 'خاطئ', 'لوحة', 'دفعت', 'ورشة', 'عطل', 'معطلة'];
  const weakPhrases = ['آسف', 'أعتذر', 'مستعجل', 'متعب', 'نسيت'];

  const hasEvidence = evidenceKeywords.some(k => lowerText.includes(k));
  const hasStrong = strongKeywords.some(k => lowerText.includes(k));
  const isWeak = weakPhrases.some(k => lowerText.includes(k));

  let priority = 'low';
  if (hasEvidence && hasStrong) {
    priority = 'high';
  } else if (hasStrong || hasEvidence) {
    priority = 'medium';
  }

  return {
    priority,
    hasEvidence,
    reasoning: 'تحليل تلقائي محلي (Fallback)',
    confidence: 0.6,
  };
}
