/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { UserProfile, TaskItem, NewsBulletin } from '../types';
import { Send, Sparkles, User, Bot, HelpCircle, Loader, MessageSquare } from 'lucide-react';

interface AISecProps {
  userProfile: UserProfile;
  tasks: TaskItem[];
  bulletin: NewsBulletin | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export default function AISec({ userProfile, tasks, bulletin }: AISecProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message on mount
    setMessages([
      {
        role: 'assistant',
        content: `Kính chào **${userProfile.title} ${userProfile.fullName}**. Tôi là Thư ký AI cá nhân của đồng chí. \n\nHôm nay tôi có thể hỗ trợ đồng chí soạn thảo tờ trình, tổng hợp ý kiến cuộc họp, phân tích mức độ ưu tiên công việc theo ma trận Eisenhower hoặc cập nhật nhanh tin tức buổi sáng. Đồng chí cần thảo luận chủ đề nào hôm nay?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [userProfile.fullName, userProfile.title]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare custom context to inject based on quick queries
      let richPrompt = textToSend;
      if (textToSend.includes('Hôm nay tôi cần làm gì?')) {
        const activeTasks = tasks.filter(t => !t.isCompleted);
        richPrompt = `Lãnh đạo hỏi: "Hôm nay tôi cần làm gì?". Hãy dựa vào danh sách công việc hiện tại của lãnh đạo để trả lời một cách khoa học, sắp xếp theo thứ tự ưu tiên khẩn cấp và kết thúc bằng câu hỏi gợi mở hành động.\n\nDanh sách công việc hiện trạng: ${JSON.stringify(activeTasks, null, 2)}`;
      } else if (textToSend.includes('Có gì mới hôm nay?')) {
        richPrompt = `Lãnh đạo hỏi: "Có gì mới hôm nay?". Hãy tổng hợp nhanh từ bản tin thời tiết của địa phương và danh sách tin tức sốt dẻo hôm nay để báo cáo tóm tắt ngắn gọn dưới 3 phút đọc.\n\nThông tin thời tiết và tin tức sáng nay: ${JSON.stringify(bulletin, null, 2)}`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: richPrompt }].map(m => ({
            role: m.role,
            content: m.content
          })),
          userProfile
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ AI');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content || 'Xin lỗi đồng chí, tôi chưa thể xử lý yêu cầu này lúc này.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Lỗi kết nối:** Không thể truy cập máy chủ Thư ký AI. Vui lòng đảm bảo bạn đã cấu hình \`GEMINI_API_KEY\` chính xác trong cài đặt Secrets và máy chủ đang hoạt động.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { text: 'Hôm nay tôi cần làm gì? 🗓️', label: 'Lịch trình công việc' },
    { text: 'Có gì mới hôm nay? 🗞️', label: 'Tin tức & Thời tiết sáng' },
    { text: 'Gợi ý giải quyết việc quá hạn ⚠️', label: 'Xử lý công việc dồn ứ' },
    { text: 'Hãy gợi ý kịch bản mở màn một hội nghị 🎤', label: 'Kịch bản sự kiện hành chính' }
  ];

  return (
    <div id="ai_assistant_panel" className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Sidebar with hints */}
      <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            Đề xuất hành thoại nhanh
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Nhấn vào các đề xuất bên dưới để trợ lý truy xuất dữ liệu thời gian thực và tổng hợp thông tin:
          </p>
          <div className="space-y-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(p.text)}
                className="w-full text-left bg-white hover:bg-slate-100 disabled:opacity-50 text-xs text-slate-700 font-medium py-2.5 px-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-900 mb-0.5">{p.label}</div>
                <div className="text-slate-500 text-[10px] italic">{p.text}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 mt-4 text-xs text-slate-500 space-y-1 bg-white p-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-950 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Nhận diện Người ký
          </div>
          <p><strong>Lãnh đạo:</strong> {userProfile.fullName}</p>
          <p><strong>Đơn vị:</strong> {userProfile.agency}</p>
          <p><strong>Phong cách:</strong> {userProfile.writingStyle}</p>
        </div>
      </div>

      {/* Main chat window */}
      <div className="lg:col-span-3 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden h-full">
        {/* Header bar */}
        <div className="border-b border-indigo-50 bg-indigo-50/20 px-5 py-3.5 flex justify-between items-center bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Thư ký riêng AI 24/7</h2>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                Đã sẵn sàng đồng hành cùng Lãnh đạo
              </p>
            </div>
          </div>
        </div>

        {/* Message body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((m, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message text bubble */}
              <div className="space-y-1">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}>
                  <div 
                    className="prose prose-sm max-w-none text-inherit break-words prose-headings:font-display"
                    dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }}
                  />
                </div>
                <p className={`text-[10px] text-slate-400 ${m.role === 'user' ? 'text-right' : ''}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-500 flex items-center gap-2 shadow-sm">
                <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                Thư ký đang rà soát văn bản và tư duy giải pháp...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            className="flex gap-2.5 bg-white border border-slate-200 rounded-xl p-1.5 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 transition-all shadow-sm"
          >
            <input
              type="text"
              disabled={isLoading}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="Hỏi trợ lý về tiến độ công việc hoặc yêu cầu viết tờ trình bám sát Nghị định..."
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white p-2.5 rounded-lg cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 px-1">
            <span>Phong cách phản hồi: <strong>Hành chính chuẩn mực</strong></span>
            <span>Cung cấp bởi mô hình <strong>Gemini 3.5 Flash</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
