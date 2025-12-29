declare module 'react-native-document-picker' {
  export interface DocumentPickerResponse {
    uri: string;
    fileCopyUri: string | null;
    copyError?: string;
    type: string | null;
    name: string | null;
    size: number | null;
  }

  export interface DocumentPickerOptions {
    type?: string | string[];
    allowMultiSelection?: boolean;
    copyTo?: 'cachesDirectory' | 'documentDirectory';
  }

  export const types: {
    allFiles: string;
    images: string;
    plainText: string;
    audio: string;
    pdf: string;
    zip: string;
    csv: string;
    doc: string;
    docx: string;
    ppt: string;
    pptx: string;
    xls: string;
    xlsx: string;
    video: string;
  };

  export function pick(
    options?: DocumentPickerOptions
  ): Promise<DocumentPickerResponse[]>;

  export function pickSingle(
    options?: DocumentPickerOptions
  ): Promise<DocumentPickerResponse>;

  export function isCancel(error: any): boolean;
  export function isInProgress(error: any): boolean;
}