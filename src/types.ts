/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  fullName: string;
  title: string;       // Chức vụ (e.g., Trưởng phòng, Chuyên viên, Giám đốc)
  agency: string;      // Cơ quan / Đơn vị công tác
  writingStyle: string; // Phong cách viết (Trang trọng hành chính, Ngắn gọn quyết đoán, Thuyết phục, ...)
  customInstructions: string; // Chỉ dẫn bổ sung cho thư ký AI
  location: string;    // Địa phương (e.g., Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, ...)
}

export type EisenhowerCategory = 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'normal';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: EisenhowerCategory;
  dueDate: string;
  progress: number; // 0 to 100
  isCompleted: boolean;
}

export interface MeetingItem {
  id: string;
  title: string;
  dateTime: string;
  participants: string;
  location: string;
  agenda: string;
  rawNotes?: string;
  minutes?: string; // Generated using Gemini
  actionItems?: string; // Markdown Action plan table generated using Gemini
}

export interface DocumentDraft {
  id: string;
  title: string;
  type: 'report' | 'plan' | 'official-dispatch' | 'proposal' | 'notification' | 'invitation' | 'decision' | 'minutes';
  createdAt: string;
  content: string; // Markdown content with table of contents
}

export interface NewsBulletin {
  date: string;
  weather: {
    location: string;
    temperature: string;
    humidity: string;
    uvIndex: string;
    airQuality: string;
    recommendation: string;
  };
  news: {
    category: string;
    title: string;
    summary: string;
  }[];
}

export interface IntegrationConfigs {
  gmailEmail: string;
  gmailEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  telegramEnabled: boolean;
  notionApiKey: string;
  notionPageId: string;
  notionEnabled: boolean;
  webhookUrl: string;
  webhookEnabled: boolean;
}
