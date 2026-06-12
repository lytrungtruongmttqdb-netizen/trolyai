/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MeetingItem, UserProfile } from '../types';
import { DEFAULT_MEETINGS } from '../utils';
import { parseMarkdownToHtml, downloadTxtFile } from '../utils';
import { Calendar, Users, MapPin, ClipboardList, Sparkles, Plus, Loader2, Save, Trash2, ListOrdered, FileText, Check, Copy, Clock } from 'lucide-react';

interface MeetingManagerProps {
  userProfile: UserProfile;
}

export default function MeetingManager({ userProfile }: MeetingManagerProps) {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  // New meeting form state
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [participants, setParticipants] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');

  // Editing state for active log
  const [rawNotes, setRawNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_assistant_meetings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMeetings(parsed);
      if (parsed.length > 0) {
        setSelectedMeetingId(parsed[0].id);
        setRawNotes(parsed[0].rawNotes || '');
      }
    } else {
      localStorage.setItem('ai_assistant_meetings', JSON.stringify(DEFAULT_MEETINGS));
      setMeetings(DEFAULT_MEETINGS);
      setSelectedMeetingId(DEFAULT_MEETINGS[0].id);
      setRawNotes(DEFAULT_MEETINGS[0].rawNotes || '');
    }
  }, []);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMeeting: MeetingItem = {
      id: 'meeting_' + Date.now(),
      title: title.trim(),
      dateTime: dateTime || new Date().toISOString().slice(0, 16),
      participants: participants.trim() || 'Thành phần đại diện các sở ban ngành liên quan',
      location: location.trim() || 'Phòng họp Nhà Khách UBND',
      agenda: agenda.trim() || 'Chương trình làm việc nội dung đột xuất',
      rawNotes: '',
      minutes: ''
    };

    const updated = [newMeeting, ...meetings];
    setMeetings(updated);
    localStorage.setItem('ai_assistant_meetings', JSON.stringify(updated));
    setSelectedMeetingId(newMeeting.id);
    setRawNotes('');

    // Clear form
    setTitle('');
    setDateTime('');
    setParticipants('');
    setLocation('');
    setAgenda('');
  };

  const handleSaveNotesOnly = () => {
    if (!selectedMeetingId) return;
    const updated = meetings.map(m => {
      if (m.id === selectedMeetingId) {
        return { ...m, rawNotes };
      }
      return m;
    });
    setMeetings(updated);
    localStorage.setItem('ai_assistant_meetings', JSON.stringify(updated));
    alert('Đã lưu nháp ghi nhận thô thành công!');
  };

  const handleGenerateMinutes = async () => {
    if (!selectedMeetingId) return;
    const meeting = meetings.find(m => m.id === selectedMeetingId);
    if (!meeting) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/meeting-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingTitle: meeting.title,
          dateTime: meeting.dateTime,
          location: meeting.location,
          participants: meeting.participants,
          agenda: meeting.agenda,
          rawNotes: rawNotes,
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi sinh biên bản họp bằng AI');
      }

      const data = await response.json();
      
      const updated = meetings.map(m => {
        if (m.id === selectedMeetingId) {
          return {
            ...m,
            rawNotes: rawNotes,
            minutes: data.content
          };
        }
        return m;
      });

      setMeetings(updated);
      localStorage.setItem('ai_assistant_meetings', JSON.stringify(updated));
    } catch (err: any) {
      console.error(err);
      alert('Không thể soạn lập biên bản. Vui lòng rà soát cấu hình GEMINI_API_KEY ở cài đặt Secrets.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteMeeting = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có thực sự muốn xóa cuộc họp này?')) {
      const updated = meetings.filter(m => m.id !== id);
      setMeetings(updated);
      localStorage.setItem('ai_assistant_meetings', JSON.stringify(updated));
      if (selectedMeetingId === id) {
        setSelectedMeetingId(updated.length > 0 ? updated[0].id : null);
        setRawNotes(updated.length > 0 ? updated[0].rawNotes || '' : '');
      }
    }
  };

  const handleSelectMeeting = (id: string) => {
    setSelectedMeetingId(id);
    const m = meetings.find(item => item.id === id);
    setRawNotes(m?.rawNotes || '');
  };

  const currentMeeting = meetings.find(m => m.id === selectedMeetingId);

  const handleCopyToClipboard = () => {
    if (!currentMeeting?.minutes) return;
    navigator.clipboard.writeText(currentMeeting.minutes);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadMinutes = () => {
    if (!currentMeeting?.minutes) return;
    downloadTxtFile(`BienBanHop_${currentMeeting.title.replace(/\s+/g, '_')}.md`, currentMeeting.minutes);
  };

  return (
    <div id="meetings_control_hub" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[calc(100vh-200px)]">
      {/* Left Column: Meeting forms & schedule lists */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Book a meeting */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Plus className="w-5 h-5 text-indigo-600" />
            Lên lịch cuộc họp / Sự kiện
          </h3>
          <form onSubmit={handleCreateMeeting} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên cuộc họp / Hội nghị</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ví dụ: Đại hội đồng Cổ đông thường niên..."
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ diễn ra</label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={e => setDateTime(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa điểm</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Phòng họp Trực tuyến..."
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thành phần họp (Cách nhau dấu phẩy)</label>
              <input
                type="text"
                value={participants}
                onChange={e => setParticipants(e.target.value)}
                placeholder="CEO, Trưởng phòng Kế hoạch..."
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chương trình nghị sự / Mục tiêu</label>
              <textarea
                rows={2}
                value={agenda}
                onChange={e => setAgenda(e.target.value)}
                placeholder="Các nội dung bàn thảo chính và đầu ra chính cần phê duyệt..."
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              Lưu lịch họp vào Sổ tay
            </button>
          </form>
        </div>

        {/* Existing meeting lists */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col justify-between min-h-[220px]">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Sổ nhật trình các cuộc họp ({meetings.length})
            </h4>

            {meetings.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs italic">
                Chưa có lịch họp nào được ghi nhận.
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[280px]">
                {meetings.map(m => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMeeting(m.id)}
                    className={`group p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedMeetingId === m.id
                        ? 'border-indigo-600 bg-indigo-50/20 font-semibold'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <div className="font-bold text-slate-900 truncate flex-1">{m.title}</div>
                      <button
                        onClick={(e) => handleDeleteMeeting(m.id, e)}
                        className="text-slate-300 hover:text-red-600 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 mt-1.5 font-normal">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(m.dateTime).toLocaleString('vi-VN').split(',')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{m.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Active transcription notes & AIMinutes output */}
      <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {currentMeeting ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Split layout: notes inputs header & AI outputs */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                Đang xử lý: {currentMeeting.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-[10px] text-slate-500">
                <p><strong>👥 Thành phần:</strong> {currentMeeting.participants}</p>
                <p><strong>🎯 Nghị sự:</strong> {currentMeeting.agenda}</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[350px]">
              {/* Box 1: Keyboard prompt logs */}
              <div className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Ý kiến phát biểu / Diễn biến thô</label>
                    <span className="text-[10px] text-slate-400">Ghi nháp phác thảo khi đang họp</span>
                  </div>
                  <textarea
                    rows={12}
                    value={rawNotes}
                    onChange={e => setRawNotes(e.target.value)}
                    placeholder="Ví dụ: Giám đốc báo cáo doanh thu đạt chuẩn nhờ áp dụng AI. Trưởng bộ phận Nhân sự phản đối vì thiếu định viên biên chế. Cuộc họp thống nhất rà soát định biên trước ngày 20/06..."
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-sans"
                  />
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-3.5 mt-3">
                  <button
                    onClick={handleSaveNotesOnly}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition-all"
                  >
                    Lưu nháp thô
                  </button>
                  <button
                    onClick={handleGenerateMinutes}
                    disabled={isGenerating}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Đang tổng hợp...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        AI biên soạn biên bản
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Box 2: Markdown AI minutes print output */}
              <div className="p-4 flex flex-col justify-between bg-slate-50/20">
                <div className="flex-1 overflow-y-auto max-h-[360px]">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Kết luận & Biên bản từ AI
                    </span>
                    {currentMeeting.minutes && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={handleCopyToClipboard}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                          title="Sao chép nội dung"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={handleDownloadMinutes}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                          title="Khấu xuất biên bản"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {currentMeeting.minutes ? (
                    <div 
                      className="markdown-body p-2 text-xs"
                      dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(currentMeeting.minutes) }}
                    />
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 py-20">
                      <ListOrdered className="w-10 h-10 opacity-20 mb-2" />
                      Chưa sinh kết luận hành chính.
                      <p className="text-[10px] text-slate-500 max-w-[180px] mt-1">Họp xong hãy gõ ghi chú nhanh và bấm nút "AI biên soạn biên bản" bên cạnh.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-20 text-center">
            <Calendar className="w-12 h-12 opacity-15 mb-2.5 text-slate-800" />
            <h3 className="font-semibold text-slate-800 text-sm mb-1">Chưa chọn lịch làm việc</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Vui lòng lập một lịch làm việc mới hoặc lựa chọn một cuộc họp trong sổ nhật trình để cập nhật chỉ thị thảo luận rầm rộ.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
