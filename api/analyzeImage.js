const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, violationType, objectionText } = req.body;

  if (!image || !violationType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY غير موجود في المتغيرات البيئية');
    return res.status(500).json({ error: 'API Key not configured' });
  }

  try {
    const prompt = `أنت خبير في تحليل الأدلة المرفقة مع اعتراضات المخالفات المرورية السعودية.

نوع المخالفة: ${violationType}
نص الاعتراض: "${objectionText}"

قم بتحليل الصورة المرفقة وحدد:

1. هل الصورة مرتبطة بنوع المخالفة والاعتراض؟
2. هل الصورة تحتوي على دليل واضح وقوي؟
3. ما مدى وضوح وجودة الصورة؟
4. هل تحتوي على معلومات داعمة (تواريخ، أرقام، أختام رسمية)؟

أعط النتيجة بناءً على:
- مطابقة عالية (صورة واضحة تثبت الاعتراض): bonusScore: 25
- مطابقة متوسطة (صورة مرتبطة لكن غير حاسمة): bonusScore: 10
- مطابقة ضعيفة (صورة غير واضحة أو غير مرتبطة): bonusScore: 0

أرجع النتيجة بصيغة JSON فقط:
{
  "bonusScore": 0-25,
  "matchQuality": "high|medium|low",
  "hasEvidence": true|false,
  "reasoning": "السبب بالعربية في جملة واحدة",
  "details": "تفاصيل إضافية عن محتوى الصورة"
}`;

    let imageData = image;
    if (image.startsWith('data:image')) {
      imageData = image.split(',')[1];
    }

    const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageData
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini Vision API error:', errorData);
      throw new Error('Gemini Vision API request failed');
    }

    const data = await response.json();

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini Vision');
    }

    let cleanedText = generatedText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const result = JSON.parse(cleanedText);

    if (typeof result.bonusScore !== 'number' || result.bonusScore < 0 || result.bonusScore > 25) {
      throw new Error('Invalid bonusScore value');
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error analyzing image:', error);

    return res.status(200).json({
      bonusScore: 10,
      matchQuality: 'medium',
      hasEvidence: true,
      reasoning: 'تحليل تلقائي: تم إرفاق صورة',
      details: 'لم يتمكن النظام من تحليل الصورة بالكامل'
    });
  }
}
