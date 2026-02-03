declare module 'mammoth' {
  export interface ConvertToHtmlOptions {
    arrayBuffer: ArrayBuffer;
    styleMap?: string[];
    includeDefaultStyleMap?: boolean;
    transformDocument?: any;
  }

  export interface ConvertToHtmlResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function convertToHtml(options: ConvertToHtmlOptions): Promise<ConvertToHtmlResult>;
  export function extractRawText(options: ConvertToHtmlOptions): Promise<ConvertToHtmlResult>;
}