/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('CẢNH BÁO: KEY API GEMINI_API_KEY chưa cấu hình trong môi trường.');
      // Trả về mock hoặc cố gắng dùng giá trị trống, tốt nhất nên ném lỗi rõ ràng khi thực thi API
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// REST API Routes

/**
 * 1. TRÒ CHUYỆN VỚI TRỢ LÝ AI (POST /api/chat)
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userProfile } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Dữ liệu tin nhắn không hợp lệ' });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Yêu cầu cấu hình GEMINI_API_KEY để kích hoạt Trợ lý AI.' });
    }

    // Build smart instructions tailored to user profile
    const name = userProfile?.fullName || 'Đồng chí';
    const title = userProfile?.title || 'Cán bộ';
    const agency = userProfile?.agency || 'Cơ quan';
    const style = userProfile?.writingStyle || 'Trang trọng, chuẩn mực';
    const customRules = userProfile?.customInstructions || '';

    const systemInstruction = `
Bạn là Trợ Lý Điều Hành AI Cao Cấp (AI Executive Assistant Agent) của một lãnh đạo, công chức Việt Nam.
Thông tin cá nhân của người dùng bạn đang hỗ trợ:
- Họ tên: ${name}
- Chức vụ: ${title}
- Đơn vị công tác: ${agency}
- Phong cách giao tiếp/viết: ${style}
- Chỉ thị riêng: ${customRules}

Nhiệm vụ của bạn là:
1. Giao tiếp chuyên nghiệp, kính trọng, lịch sự, chuẩn mực hành chính Việt Nam. Luôn xưng hô phù hợp (ví dụ: 'Kính thưa Anh/Chị', 'Thưa Lãnh đạo', hoặc 'Kính thưa Đồng chí ${name}').
2. Có tư duy phản biện cao, lập luận sắc bén, kiến thức pháp luật hành chính Việt Nam phong phú.
3. Giải quyết công việc ngắn gọn trước, chi tiết sau. Chủ động đưa ra phương án tối ưu có hành động tiếp theo rõ ràng (Mức ưu tiên, Deadline).
4. Phân tích tài liệu, so sánh chính sách chính xác, không bịa đặt nguồn luật hoặc số liệu.
`;

    // Map conversation history
    const contents = messages.map((msg: any) => {
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error('Lỗi khi gọi API Chat:', error);
    res.status(500).json({ error: error.message || 'Lỗi hệ thống khi xử lý yêu cầu AI' });
  }
});

/**
 * 2. SOẠN THẢO VĂN BẢN CHUẨN HÀNH CHÍNH (POST /api/draft)
 */
app.post('/api/draft', async (req, res) => {
  try {
    const { docType, title, mainContent, userProfile } = req.body;

    if (!docType || !title) {
      return res.status(400).json({ error: 'Thiếu thông tin loại hoặc tiêu đề văn bản' });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Yêu cầu cấu hình GEMINI_API_KEY để soạn thảo văn bản.' });
    }

    const userName = userProfile?.fullName || 'Nguyễn Văn A';
    const userTitle = userProfile?.title || 'Trưởng phòng';
    const userAgency = userProfile?.agency || 'Ủy ban nhân dân Quận 1';

    const systemInstruction = `
Bạn là chuyên gia soạn thảo văn bản hành chính Việt Nam cấp tỉnh/trung ương.
Bạn nắm vững Nghị định 30/2020/NĐ-CP về công tác văn thư.

Hãy tạo văn bản cho loại: "${docType}" có tiêu đề: "${title}".
Sử dụng thông tin người dùng:
- Người ký/soạn thảo: ${userName}
- Chức vụ: ${userTitle}
- Đơn vị phát hành: ${userAgency}

Yêu cầu định dạng văn bản:
1. Có quốc hiệu, tiêu ngữ:
   CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
   Độc lập - Tự do - Hạnh phúc
2. Có đơn vị phát hành biên trái (e.g. ${userAgency} hoặc tên cơ quan cấp trên + cơ quan phát hành), kèm Số hiệu, địa danh ngày tháng năm (theo chuẩn hiện tại).
3. Sử dụng font sans-serif hiện đại, trình bày đẹp mắt bằng MARKDOWN.
4. Có phần "MỤC LỤC TỰ ĐỘNG BẢN TÓM TẮT" ở đầu để lãnh đạo dễ theo dõi.
5. Nội dung phải cực kỳ trang trọng, từ ngữ hành chính, lý luận sắc bén, lập luận bài bản. Có các căn cứ pháp lý cần thiết và danh mục giải pháp cụ thể.
6. Kết thúc thúc đẩy hành động với chữ ký/chức danh thích hợp, "Nơi nhận" cụ thể chuẩn văn thư hành chính.
`;

    const prompt = `
Hãy soạn thảo chi tiết văn bản hành chính có thông tin:
- Loại văn bản: ${docType}
- Tiêu đề: ${title}
- Ý chính/Nội dung người dùng cung cấp:
"${mainContent || 'Không có ghi chú thêm, vui lòng tự động phác thảo một văn bản toàn diện, đầy đủ nội dung nghiệp vụ.'}"

Yêu cầu xuất ra định dạng Markdown (có mục lục tự quản lý, tổ chức chặt chẽ thành các phần rõ ràng).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error('Lỗi khi soạn thảo văn bản:', error);
    res.status(500).json({ error: error.message || 'Lỗi soạn thảo văn bản hành chính' });
  }
});

/**
 * 3. TỔNG HỢP BIÊN BẢN VÀ KẾT LUẬN CUỘC HỌP (POST /api/meeting-minutes)
 */
app.post('/api/meeting-minutes', async (req, res) => {
  try {
    const { meetingTitle, rawNotes, participants, dateTime, location, agenda } = req.body;

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Yêu cầu cấu hình GEMINI_API_KEY để xử lý biên bản họp.' });
    }

    const systemInstruction = `
Bạn là một Thư ký cuộc họp chuyên nghiệp, có kỹ năng tổng hợp và ghi chép trung thực, khoa học.
Nhiệm vụ của bạn là nhận các thông tin họp thô, ghi chú phác thảo, sau đó xuất ra:
1. MỘT BẢN BIÊN BẢN CUỘC HỌP chuẩn mực hành chính (gồm Thời gian phát biểu, Người phát biểu, Ý kiến đóng góp).
2. KẾT LUẬN CHI TIẾT CỦA CHỦ TRÌ cuộc họp.
3. BẢNG PHÂN CÔNG NHIỆM VỤ (Action plan) định dạng Markdown, gồm: STT, Nội dung công việc, Người chịu trách nhiệm, Tiến độ dự kiến, Mức độ ưu tiên và Deadline cụ thể.
`;

    const prompt = `
Hãy lập Biên bản cuộc họp và Bảng phân công nhiệm vụ từ các dữ liệu sau:
- Tên cuộc họp: ${meetingTitle}
- Thời gian: ${dateTime}
- Địa điểm: ${location}
- Thành phần tham dự: ${participants}
- Nội dung nghị sự: ${agenda}
- Ghi chú thảo luận thô:
"${rawNotes || 'Không có ghi chú thảo luận thô. Hãy sinh ra biên bản họp giả định chuyên nghiệp dựa trên chương trình nghị sự.'}"

Yêu cầu xuất ra định dạng Markdown sáng rõ, trình bày bảng phân công đẹp mắt.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error('Lỗi khi xử lý biên bản họp:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 4. TỰ ĐỘNG TẠO BẢN TIN SÁNG VÀ THỜI TIẾT (POST /api/bulletin)
 */
app.post('/api/bulletin', async (req, res) => {
  try {
    const { userProfile, customPrompt } = req.body;

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Yêu cầu cấu hình GEMINI_API_KEY để tạo bản tin sáng.' });
    }

    const province = userProfile?.location || 'Hà Nội';
    const name = userProfile?.fullName || 'Lãnh đạo';
    const title = userProfile?.title || 'Cán bộ';

    const systemInstruction = `
Bạn là AI Executive Assistant Agent cao cấp. Nhiệm vụ của bạn là tổng hợp và sinh ra một BẢN TIN SÁNG chất lượng cao, định dạng JSON và có độ chính xác cực tốt dựa trên các điều kiện thực tế (Ngày hôm nay, địa phương người dùng).
Hôm nay là ngày 12 tháng 06 năm 2026 (Theo giờ hệ thống hiện tại).

Vui lòng tạo dữ liệu thời tiết và tin tức thực dụng, chuyên nghiệp và có tính thuyết phục cho địa phương: ${province}.
Lưu ý về chủ đề tin tức: Tập trung vào tin chính trị kinh tế, Hành chính công, pháp luật Việt Nam, Chuyển đổi số doanh nghiệp, Trí tuệ ảo AI và Công nghệ mới nổi trong ngày.
`;

    const prompt = `
Hãy viết bản tin sáng đặc biệt hỗ trợ đồng chí Lãnh đạo ${name} (${title}) tại ${province}.
Dựa trên yêu cầu tùy chỉnh: "${customPrompt || 'Bản tin sáng toàn diện định kỳ 07:00 AM'}"

Hãy trả về phản hồi dưới định dạng JSON khớp hoàn chỉnh với cấu trúc dưới đây. Không có ký tự không hợp lệ ngoài JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: 'Ngày tháng hiện tại của bản tin sáng, e.g., Thứ Sáu, ngày 12/06/2026' },
            weather: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                temperature: { type: Type.STRING, description: 'Từ bao nhiêu đến bao nhiêu độ C' },
                humidity: { type: Type.STRING },
                uvIndex: { type: Type.STRING, description: 'Chỉ số UV và cấp độ' },
                airQuality: { type: Type.STRING, description: 'Chất lượng không khí AQI, kèm lời khuyên' },
                recommendation: { type: Type.STRING, description: 'Khuyến nghị thiết thực nhất cho ngày hôm nay (e.g., mang ô, hạn chế ra ngoài giờ nắng gắt, uống nước)' }
              },
              required: ['location', 'temperature', 'humidity', 'uvIndex', 'airQuality', 'recommendation']
            },
            news: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: 'Các nhóm: Tin Nổi Bật, Tin Chính phủ, Chuyển đổi số, Công nghệ AI, Tin Địa phương, Tin Kinh tế' },
                  title: { type: Type.STRING, description: 'Tiêu đề tin ngắn gọn nhưng cực kỳ giật gân, cuốn hút và ý nghĩa' },
                  summary: { type: Type.STRING, description: 'Tóm tắt nội dung tin tức cô đọng trong 2-3 dòng, mang tính thời sự' }
                },
                required: ['category', 'title', 'summary']
              }
            }
          },
          required: ['date', 'weather', 'news']
        }
      }
    });

    const resultText = response.text ? response.text.trim() : '';
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Lỗi khi thiết lập bản tin sáng:', error);
    res.status(500).json({ error: error.message || 'Lỗi sinh bản tin sáng' });
  }
});

/**
 * 5. PHÂN TÍCH MA TRẬN EISENHOWER VÀ CÔNG VIỆC (POST /api/analyze-tasks)
 */
app.post('/api/analyze-tasks', async (req, res) => {
  try {
    const { tasks, userProfile } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Không tìm thấy danh sách công việc cần phân tích' });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Yêu cầu cấu hình GEMINI_API_KEY để phân tích công việc.' });
    }

    const name = userProfile?.fullName || 'Đồng chí';
    const role = userProfile?.title || 'Lãnh đạo';

    const systemInstruction = `
Bạn là chuyên gia tư vấn năng suất, chuyên gia huấn luyện tổ chức công việc cấp cao.
Nhiệm vụ của bạn là phân tích danh sách công việc hiện tại của đồng chí ${name} (${role}) theo Ma trận quản trị thời gian Eisenhower.
Hãy phát hiện quá tải, đề xuất ủy quyền, tối ưu hóa các việc khẩn và gợi ý giải pháp dứt điểm.
`;

    const prompt = `
Dưới đây là danh sách các công việc của tôi trong hệ thống:
${JSON.stringify(tasks, null, 2)}

Hãy xuất ra bảng ĐÁNH GIÁ MA TRẬN NĂNG SUẤT và gợi ý chiến lược giải quyết cụ thể:
1. Đánh giá mật độ công việc ở các ô (Khẩn cấp & Quan trọng | Quan trọng không khẩn | Khẩn nhưng không quan trọng | Bình thường).
2. Phát hiện các điểm nghẽn (Quá hạn, dồn ứ đầu mục).
3. Đề xuất Kế hoạch hành động chi tiết 3 giải pháp rốt ráo nhất để cải thiện chất lượng công việc cho ngày hôm nay và tuần này.
4. Trả lời bằng ngôn ngữ truyền cảm hứng, chuyên nghiệp và đầy quyết liệt. Định dạng Markdown trực quan.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Lỗi phân tích Eisenhower:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 6. TEST INTEGRATION TRIGGER (POST /api/test-webhook)
 */
app.post('/api/test-webhook', async (req, res) => {
  try {
    const { url, payload } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Vui lòng cung cấp URL webhook hợp lệ' });
    }

    console.log(`Đang gửi test tới Webhook: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        event: 'AI_EXECUTIVE_ASSISTANT_TEST_TRIGGER',
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const respText = await response.text();
      res.json({ success: true, message: 'Gửi webhook thành công!', status: response.status, data: respText });
    } else {
      res.status(400).json({ success: false, error: `Webhook trả về mã lỗi: ${response.status}`, status: response.status });
    }
  } catch (error: any) {
    console.error('Lỗi khi kích hoạt Webhook:', error);
    res.status(500).json({ error: `Lỗi kết nối: ${error.message || 'Mạng bị gián đoạn'}` });
  }
});

// Start asynchronous Server initialization to support full ESM and CommonJS bundling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // We dynamic import to avoid dev-time bundler issues
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI-Executive-Agent] Server đang chạy hoàn tất tại cổng: http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Lỗi khởi động máy chủ:', err);
});
