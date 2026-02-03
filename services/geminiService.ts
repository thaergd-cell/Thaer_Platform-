
import { GoogleGenAI, Type } from "@google/genai";
import { OmrAnswers } from "../types";

// وظيفة الحصول على المفتاح بأمان
const getApiKey = () => {
  try {
    const key = process.env.API_KEY;
    if (!key || key === "undefined" || key === "") return null;
    return key;
  } catch (e) {
    return null;
  }
};

/**
 * Creates a fresh instance of GoogleGenAI following SDK guidelines.
 * Initialized with process.env.API_KEY when needed.
 */
const createAI = () => {
  const key = getApiKey();
  if (!key) return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch (e) {
    console.warn("AI Init suppressed:", e);
    return null;
  }
};

const cleanJsonString = (str: string) => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeAnswerKey = async (imageBase64: string): Promise<OmrAnswers> => {
  // Creating a new instance right before making the API call as per guidelines
  const ai = createAI();
  if (!ai) throw new Error("مفتاح API الخاص بالذكاء الاصطناعي غير متوفر حالياً. يرجى مراجعة إعدادات السيرفر.");

  try {
    const prompt = `أنت مساعد خبير في قراءة العلامات البصرية (OMR). هذه الصورة هي نموذج الإجابة (المفتاح). لكل رقم سؤال، حدد الدائرة المظللة الوحيدة التي تمثل الإجابة الصحيحة (A, B, C, D, أو E). استخرج رقم السؤال وحرف الإجابة الصحيحة المقابل له. قم بإرجاع النتيجة بصيغة JSON حصراً، على شكل مصفوفة من الكائنات، حيث يحتوي كل كائن على مفتاح 'q' لرقم السؤال ومفتاح 'a' لحرف الإجابة.`;
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              q: { type: Type.STRING },
              a: { type: Type.STRING }
            },
            required: ["q", "a"]
          }
        }
      }
    });

    // response.text is a property, not a method
    const text = response.text;
    const list = JSON.parse(cleanJsonString(text || "[]"));
    const result: OmrAnswers = {};
    if (Array.isArray(list)) {
        list.forEach((item: any) => { if (item.q && item.a) result[item.q] = item.a.toUpperCase(); });
    }
    return result;
  } catch (error: any) {
    throw new Error("فشل تحليل نموذج الإجابة: " + error.message);
  }
};

export const analyzeStudentSheet = async (imageBase64: string): Promise<{
  studentName: string;
  studentId: string;
  answers: OmrAnswers;
}> => {
  // Creating a new instance right before making the API call as per guidelines
  const ai = createAI();
  if (!ai) throw new Error("الذكاء الاصطناعي غير مفعل.");

  try {
    const prompt = `أنت مساعد خبير في قراءة العلامات البصرية (OMR). هذه الصورة هي ورقة إجابة طالب. مهمتك هي استخراج ثلاث معلومات: 1. اسم الطالب الكامل. 2. الرقم الجامعي للطالب. 3. لكل رقم سؤال، حدد الدائرة المظللة الوحيدة التي تمثل إجابة الطالب (A, B, C, D, أو E). قم بإرجاع النتيجة بصيغة JSON حصراً، على شكل كائن يحتوي على ثلاثة مفاتيح: 'studentName', 'studentId', و 'answers'. يجب أن يحتوي مفتاح 'answers' على مصفوفة من الكائنات، حيث يحتوي كل كائن على مفتاح 'q' لرقم السؤال ومفتاح 'a' لحرف الإجابة.`;
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
         parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
         responseSchema: {
            type: Type.OBJECT,
            properties: {
              studentName: { type: Type.STRING },
              studentId: { type: Type.STRING },
              answers: { 
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: { q: { type: Type.STRING }, a: { type: Type.STRING } },
                      required: ["q", "a"]
                  }
              }
            },
            required: ["studentName", "studentId", "answers"]
         }
      }
    });

    // response.text is a property, not a method
    const data = JSON.parse(cleanJsonString(response.text || "{}"));
    const answersMap: OmrAnswers = {};
    if (Array.isArray(data.answers)) {
        data.answers.forEach((item: any) => { if (item.q && item.a) answersMap[item.q] = item.a.toUpperCase(); });
    }

    return {
        studentName: data.studentName || "غير معروف",
        studentId: data.studentId || "غير معروف",
        answers: answersMap
    };
  } catch (error: any) {
    throw new Error("فشل تحليل ورقة الطالب: " + error.message);
  }
};

export const generateEmailDraft = async (subject: string): Promise<string> => {
  // Creating a new instance right before making the API call as per guidelines
  const ai = createAI();
  if (!ai) throw new Error("الذكاء الاصطناعي غير متصل.");

  try {
    const prompt = `أنت مساعد إداري محترف. قم بكتابة نص رسالة بريد إلكتروني رسمية ومهذبة باللغة العربية حول الموضوع التالي: "${subject}". 
    اجعل الرسالة واضحة، منسقة، وجاهزة للإرسال. لا تضع أي مقدمات أو خاتمات خارج نص الرسالة.`;
    
    // Using 'gemini-flash-latest' for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt
    });

    // response.text is a property, not a method
    return response.text || "";
  } catch (error: any) {
    throw new Error("فشل توليد النص: " + error.message);
  }
};