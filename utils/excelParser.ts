
import { EmailRecipient } from '../types';

// استيراد ديناميكي لتجنب تحذيرات البناء في بعض البيئات
export const parseExcelForEmails = async (file: File): Promise<EmailRecipient[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        // @ts-ignore - XLSX متاح عالمياً عبر CDN
        const XLSX = await import('xlsx');
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const emails: Set<string> = new Set();
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        jsonData.forEach((row: any) => {
           if (Array.isArray(row)) {
               row.forEach((cell: any) => {
                   if (cell && typeof cell === 'string') {
                       const trimmed = cell.trim();
                       if (emailRegex.test(trimmed)) {
                           emails.add(trimmed);
                       }
                   }
               });
           }
        });

        if (emails.size === 0) {
            reject("لم يتم العثور على أي عناوين بريد إلكتروني صالحة في الملف.");
            return;
        }

        const recipients: EmailRecipient[] = Array.from(emails).map(email => ({
            email,
            status: 'pending'
        }));

        resolve(recipients);

      } catch (error) {
        console.error(error);
        reject("فشل في قراءة ملف الإكسل. تأكد من تحميل المكتبة.");
      }
    };

    reader.onerror = () => reject("فشل في قراءة الملف.");
    reader.readAsBinaryString(file);
  });
};
