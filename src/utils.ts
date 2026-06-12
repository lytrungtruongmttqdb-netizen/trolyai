/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaskItem, MeetingItem, DocumentDraft, NewsBulletin, UserProfile, IntegrationConfigs } from './types';

// Safe regex-based markdown parser for React 19 compatibility
export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown
    // Escape HTML moderately to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
    return `<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto font-mono text-xs my-4 shadow-inner">${p1}</pre>`;
  });

  // Table parser
  const lines = html.split('\n');
  let inTable = false;
  let tableRows: string[] = [];
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else {
      if (inTable) {
        processedLines.push(renderTableHtml(tableRows));
        inTable = false;
      }
      processedLines.push(lines[i]);
    }
  }
  if (inTable) {
    processedLines.push(renderTableHtml(tableRows));
  }

  html = processedLines.join('\n');

  // Headers (h1, h2, h3, h4)
  html = html.replace(/^### (.*$)/gim, '<h3 class="font-display font-semibold text-lg text-slate-800 mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="font-display font-bold text-xl text-slate-900 mt-8 mb-3 border-b border-slate-100 pb-1">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="font-display font-extrabold text-2xl text-slate-950 mt-10 mb-4 pb-2 border-b-2 border-slate-200">$1</h1>');

  // Bold / Italic
  html = html.replace(/\*\*(.*?)\*\//g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-slate-400 pl-4 py-1 italic my-4 text-slate-600 bg-slate-50 rounded-r">$1</blockquote>');

  // Lists
  html = html.replace(/^\s*\-\s+(.*$)/gim, '<li class="my-1 text-slate-700 ml-4 list-disc">$1</li>');
  html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="my-1 text-slate-700 ml-4 list-disc">$1</li>');
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="my-1 text-slate-700 ml-4 list-decimal">$1</li>');

  // Paragraph lines (not already rendered into HTML blocks)
  const paragraphLines = html.split('\n');
  const finalized = paragraphLines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '<br/>';
    if (trimmed.startsWith('<h') || 
        trimmed.startsWith('<blockquote') || 
        trimmed.startsWith('<li') || 
        trimmed.startsWith('<ul') || 
        trimmed.startsWith('<ol') || 
        trimmed.startsWith('<pre') || 
        trimmed.startsWith('<table') || 
        trimmed.startsWith('<tr') || 
        trimmed.startsWith('<div')) {
      return line;
    }
    return `<p class="leading-relaxed text-slate-700 my-2">${line}</p>`;
  });

  return finalized.join('\n');
}

function renderTableHtml(rows: string[]): string {
  if (rows.length < 2) return '';
  
  // Exclude divider lines like |---|---|
  const contentRows = rows.filter(r => !/^[|\s-]+$/.test(r.replace(/[^|\s-]/g, '')));
  if (contentRows.length === 0) return '';

  let html = '<div class="overflow-x-auto my-6 shadow-sm border border-slate-200 rounded-lg"><table class="min-w-full divide-y divide-slate-200 text-sm font-sans">';
  
  // Header row
  const headerCols = contentRows[0].split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
  html += '<thead class="bg-slate-50 text-slate-800 font-semibold"><tr>';
  headerCols.forEach(col => {
    html += `<th class="px-4 py-3 text-left font-medium border-b border-slate-200">${col}</th>`;
  });
  html += '</tr></thead><tbody class="divide-y divide-slate-100 bg-white">';

  // Body rows
  for (let i = 1; i < contentRows.length; i++) {
    const bodyCols = contentRows[i].split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    html += '<tr class="hover:bg-slate-50 transition-colors">';
    bodyCols.forEach(col => {
      html += `<td class="px-4 py-3 text-slate-600 border-b border-slate-100">${col}</td>`;
    });
    html += '</tr>';
  }

  html += '</tbody></table></div>';
  return html;
}

// File export helper
export function downloadTxtFile(filename: string, content: string) {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// In-browser mock defaults
export const DEFAULT_USER_PROFILE: UserProfile = {
  fullName: 'Lý Trung Trường',
  title: 'Chuyên viên Tổng hợp',
  agency: 'Ủy ban MTTQ Việt Nam tỉnh Điện Biên',
  writingStyle: 'Trang trọng, chuẩn chỉ Nghị định 30/2020-CP, lý luận chặt chẽ',
  customInstructions: 'Luôn tập trung vào công tác mặt trận, tăng cường khối đại đoàn kết toàn dân tộc, và hỗ trợ đời sống nhân dân tỉnh Điện Biên.',
  location: 'Điện Biên'
};

export const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Soạn thảo Báo cáo Cải cách hành chính Quý II/2026',
    description: 'Tổng hợp số liệu xử lý hồ sơ một cửa từ 18 huyện, thị xã gửi về và so sánh kết quả cải tiến với Quý I.',
    category: 'urgent-important',
    dueDate: '2026-06-15',
    progress: 70,
    isCompleted: false
  },
  {
    id: 't-2',
    title: 'Ký phê duyệt Kế hoạch Số hóa hồ sơ cán bộ công chức',
    description: 'Trình Lãnh đạo lãnh đạo ký hồ sơ kế hoạch phối hợp với bưu điện tập huấn số hóa văn bản.',
    category: 'urgent-important',
    dueDate: '2026-06-13',
    progress: 90,
    isCompleted: false
  },
  {
    id: 't-3',
    title: 'Nghiên cứu dự thảo Đề án đô thị thông minh',
    description: 'So sánh chỉ số chuyển đổi số các tỉnh lân cận và xây dựng giải pháp trọng tâm cho đô thị thông minh.',
    category: 'important-not-urgent',
    dueDate: '2026-06-30',
    progress: 30,
    isCompleted: false
  },
  {
    id: 't-4',
    title: 'Chuẩn bị phòng họp, tài liệu đón tiếp phái đoàn Hội đồng nhân dân',
    description: 'In ấn tài liệu báo cáo giám sát chuyên đề xây dựng nông thôn mới năm 2026.',
    category: 'urgent-not-important',
    dueDate: '2026-06-12',
    progress: 100,
    isCompleted: true
  },
  {
    id: 't-5',
    title: 'Đăng ký tham gia Seminar về Ứng dụng AI trong Chuyển đổi số Công',
    description: 'Học tập kinh nghiệm ứng dụng trợ lý ảo pháp luật của Bộ Tư pháp.',
    category: 'normal',
    dueDate: '2026-06-18',
    progress: 0,
    isCompleted: false
  }
];

export const DEFAULT_MEETINGS: MeetingItem[] = [
  {
    id: 'm-1',
    title: 'Họp Giao Ban Đột Xuất Giải Quyết Vướng Mắc Dự án Đất Đai',
    dateTime: '2026-06-12T09:00',
    participants: 'Đ/c Phó Chủ tịch UBND Tỉnh, Sở Tài nguyên Môi trường, Sở Xây dựng, UBND Thành phố.',
    location: 'Phòng họp số 2 - Nhà Ủy ban',
    agenda: 'Tháo gỡ ách tắc đền bù giải phóng mặt bằng dự án nâng cấp Quốc lộ 1A đoạn qua đô thị.',
    rawNotes: 'Sở TNMT báo cáo đền bù đạt 85%, vướng 12 hộ gia đình chưa chịu nhận giá đền bù mới. Đ/c Phó Chủ tịch kết luận: UBND Thành phố phối hợp đoàn thể tuyên truyền vận động trước ngày 20/06. Sở Tài chính rà soát hệ số điều chuẩn và báo cáo UBND trước ngày 15/06.'
  },
  {
    id: 'm-2',
    title: 'Họp Tổng Kết Công Tác Đảng Bộ Văn Phòng UBND',
    dateTime: '2026-06-15T14:00',
    participants: 'Toàn thể đảng viên Chi bộ Văn phòng',
    location: 'Hội trường Lớn',
    agenda: 'Đánh giá xếp loại đảng viên 6 tháng đầu năm 2026.',
    rawNotes: 'Họp bình xét thi đua khen thưởng cho các cán bộ, chuyên viên hoàn thành xuất sắc nhiệm vụ trong nửa đầu năm.'
  }
];

export const DEFAULT_BULLETIN_DATA: NewsBulletin = {
  date: 'Thứ Sáu, ngày 12 tháng 06 năm 2026',
  weather: {
    location: 'Điện Biên',
    temperature: '25 - 32°C',
    humidity: '78%',
    uvIndex: '10 (Rất cao)',
    airQuality: 'AQI: 52 - Tốt',
    recommendation: 'Không khí tại tỉnh Điện Biên ngoài trời tương đối mát mẻ và ôn hòa, rất thuận lợi cho công tác tuần tra cơ sở. Tuy nhiên chỉ số tia cực tím cao vào khoảng trưa, kính đề nghị Lãnh đạo trang bị ô gập, kính râm và uống đủ nước khi đi khảo sát thực tế tại các bản làng vùng cao.'
  },
  news: [
    {
      category: 'Tin Nổi Bật',
      title: 'Điện Biên đẩy mạnh phong trào Toàn dân đoàn kết xây dựng đời sống văn hóa',
      summary: 'Ủy ban Mặt trận Tổ quốc tỉnh Điện Biên phát động chiến dịch thi đua, hỗ trợ xóa nhà tạm cho các hộ gia đình chính sách và đồng bào nghèo tại các huyện biên giới.'
    },
    {
      category: 'Tin AI & Công Nghệ',
      title: 'Công bố trợ lý AI pháp luật phiên bản công vụ thế hệ mới',
      summary: 'Trợ lý AI hỗ trợ rà soát 25,000 văn bản quy phạm pháp luật chỉ trong 5 giây, bảo đảm tham chiếu đúng điều khoản và tránh mâu thuẫn chính sách.'
    },
    {
      category: 'Tin Mặt Trận Số',
      title: 'Điện Biên ứng dụng chuyển đổi số trong khảo sát ý kiến người dân',
      summary: 'Kế hoạch triển khai quét mã QR tại các Ban công tác Mặt trận khu phố bản làng giúp ghi nhận nhanh ý kiến, kiến nghị chính đáng của đồng bào cử tri.'
    },
    {
      category: 'Tin Địa Phương',
      title: 'Đoàn đại biểu Mặt trận Tổ quốc làm việc tại các xã vùng cao Điện Biên Đông',
      summary: 'Lãnh đạo Ủy ban chỉ đạo khảo sát hiệu quả các quỹ hỗ trợ sinh kế nông nghiệp, thúc đẩy sản xuất bền vững cho đồng bào các dân tộc thiểu số.'
    }
  ]
};

export const DEFAULT_INTEGRATIONS: IntegrationConfigs = {
  gmailEmail: 'lytrungtruongmttqdb@gmail.com',
  gmailEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  telegramEnabled: false,
  notionApiKey: '',
  notionPageId: '',
  notionEnabled: false,
  webhookUrl: 'https://n8n.system.mttq.gov.vn/webhook/office-assistant',
  webhookEnabled: false
};
