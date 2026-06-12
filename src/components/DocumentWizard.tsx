/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, DocumentDraft } from '../types';
import { parseMarkdownToHtml, downloadTxtFile } from '../utils';
import { FileText, Plus, Sparkles, Copy, Download, Printer, Save, Trash2, Check, FileCheck, Loader2, ArrowRight } from 'lucide-react';

interface DocumentWizardProps {
  userProfile: UserProfile;
}

const DOCUMENT_TYPES = [
  { value: 'report', label: 'Báo cáo Hành chính (Tuần/Tháng/Năm)' },
  { value: 'proposal', label: 'Tờ trình (Phê duyệt/Cấp kinh phí)' },
  { value: 'official-dispatch', label: 'Công văn (Chỉ đạo/Phối hợp)' },
  { value: 'plan', label: 'Kế hoạch công tác / Đề án' },
  { value: 'notification', label: 'Thông báo Kết luận / Thông báo nhanh' },
  { value: 'invitation', label: 'Giấy mời họp / Sự kiện' },
  { value: 'decision', label: 'Quyết định ban hành / Thành lập tổ' },
];

export default function DocumentWizard({ userProfile }: DocumentWizardProps) {
  const [drafts, setDrafts] = useState<DocumentDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  
  // Form state
  const [docType, setDocType] = useState('report');
  const [title, setTitle] = useState('');
  const [mainContent, setMainContent] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_document_drafts');
    if (saved) {
      const parsed = JSON.parse(saved);
      setDrafts(parsed);
      if (parsed.length > 0) {
        setSelectedDraftId(parsed[0].id);
      }
    }
  }, []);

  const handleCreateNew = () => {
    setSelectedDraftId(null);
    setTitle('');
    setMainContent('');
  };

  const currentDraft = drafts.find(d => d.id === selectedDraftId);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsGenerating(true);
    try {
      const selectedTypeLabel = DOCUMENT_TYPES.find(d => d.value === docType)?.label || docType;
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          docType: selectedTypeLabel,
          title,
          mainContent,
          userProfile,
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi soạn thảo bằng AI');
      }

      const data = await response.json();
      
      const newDraft: DocumentDraft = {
        id: 'draft_' + Date.now(),
        title: title,
        type: docType as any,
        createdAt: new Date().toLocaleString('vi-VN'),
        content: data.content
      };

      const updatedDrafts = [newDraft, ...drafts];
      setDrafts(updatedDrafts);
      localStorage.setItem('ai_document_drafts', JSON.stringify(updatedDrafts));
      setSelectedDraftId(newDraft.id);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ AI. Vui lòng cấu hình GEMINI_API_KEY ở Settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có thực sự muốn xóa văn bản này khỏi bộ nhớ cục bộ?')) {
      const filtered = drafts.filter(d => d.id !== id);
      setDrafts(filtered);
      localStorage.setItem('ai_document_drafts', JSON.stringify(filtered));
      if (selectedDraftId === id) {
        setSelectedDraftId(filtered.length > 0 ? filtered[0].id : null);
      }
    }
  };

  const handleCopyToClipboard = () => {
    if (!currentDraft) return;
    navigator.clipboard.writeText(currentDraft.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentDraft) return;
    const sanitizedTitle = currentDraft.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    downloadTxtFile(`VanBan_${sanitizedTitle}.md`, currentDraft.content);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="document_wizard_view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[calc(100vh-200px)]">
      {/* Left panel: Form, and Saved drafts list */}
      <div className="lg:col-span-5 flex flex-col gap-5 no-print">
        {/* Form creation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-950 font-display flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              Soạn thảo văn bản mới
            </h3>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md transition-all font-semibold active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Tạo mới
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mẫu thể thức hành chính Việt Nam</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
              >
                {DOCUMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề gốc văn bản</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ví dụ: Đẩy nhanh tiến độ giải phóng mặt bằng đường cao tốc..."
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tóm tắt ý chính / Chỉ thị riêng của Thủ trưởng</label>
              <textarea
                rows={5}
                value={mainContent}
                onChange={e => setMainContent(e.target.value)}
                placeholder="Nhập các số liệu cụ thể cần đưa vào báo cáo, cam kết tiến độ giải quyết, căn cứ pháp lý bổ sung..."
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || !title.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs py-3 px-4 rounded-lg transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thư ký AI đang soạn và đồng bộ liên tục...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Tự động lập văn bản chuẩn Nghị định 30
                </>
              )}
            </button>
          </form>
        </div>

        {/* History tracking list */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col min-h-[180px]">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2.5 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Lịch sử lưu văn bản hành chính ({drafts.length})
          </h4>
          
          {drafts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-6">
              <FileText className="w-8 h-8 opacity-25 mb-1 text-slate-500" />
              Chưa có văn bản hành chính soạn thảo.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2">
              {drafts.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDraftId(d.id)}
                  className={`group flex justify-between items-center p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedDraftId === d.id
                      ? 'border-indigo-600 bg-indigo-50/20 font-semibold text-slate-900'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${selectedDraftId === d.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="truncate pr-1">{d.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-slate-400">{d.createdAt.split(' ')[1]}</span>
                    <button
                      onClick={(e) => handleDeleteDraft(d.id, e)}
                      className="text-slate-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Editor and visual preview */}
      <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden print-container shadow-sm">
        {currentDraft ? (
          <>
            {/* Control Panel Header */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 flex flex-wrap gap-2 justify-between items-center no-print">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600/10 text-indigo-700 font-semibold px-2 py-1 rounded text-[10px] uppercase">
                  {DOCUMENT_TYPES.find(dt => dt.value === currentDraft.type)?.label.split(' ')[0] || 'Văn bản'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Bản thảo lưu <strong>{currentDraft.createdAt}</strong></span>
              </div>
              <div className="flex items-center gap-2 mr-1">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-1 text-[10px] text-slate-700 bg-white hover:bg-slate-100 py-1.5 px-3 border border-slate-200 rounded-lg font-medium cursor-pointer transition-all active:scale-95"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {isCopied ? 'Đã chép' : 'Sao chép Markdown'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-[10px] text-slate-700 bg-white hover:bg-slate-100 py-1.5 px-3 border border-slate-200 rounded-lg font-medium cursor-pointer transition-all active:scale-95"
                >
                  <Download className="w-3 h-3" />
                  Tải .md
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 text-[10px] text-white bg-slate-900 hover:bg-slate-800 py-1.5 px-3 rounded-lg font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  <Printer className="w-3 h-3" />
                  In Văn Bản
                </button>
              </div>
            </div>

            {/* Document body viewport */}
            <div className="flex-1 overflow-y-auto px-10 py-12 font-sans overflow-x-hidden print-container">
              {/* Formal layout for administrative */}
              <div className="grid grid-cols-2 gap-4 text-center text-xs text-slate-400 font-semibold mb-8">
                <div>
                  <p className="text-slate-800 uppercase tracking-tight">{userProfile.agency || 'VĂN PHÒNG CHÍNH PHỦ'}</p>
                  <p className="font-bold text-slate-950 font-display mt-0.5">VĂN PHÒNG ỦY BAN nhân dân</p>
                  <div className="w-[100px] border-b border-slate-300 mx-auto mt-2"></div>
                </div>
                <div>
                  <p className="text-slate-950 uppercase font-bold tracking-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-semibold text-slate-800 mt-0.5">Độc lập - Tự do - Hạnh phúc</p>
                  <div className="w-[120px] border-b border-slate-800 mx-auto mt-2"></div>
                </div>
              </div>

              {/* Document markdown content rendered safely */}
              <div 
                className="markdown-body text-slate-800 leading-relaxed font-sans mt-6 select-text"
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(currentDraft.content) }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-24 px-6 text-center">
            <FileText className="w-12 h-12 opacity-15 mb-2.5 text-slate-900" />
            <h3 className="font-semibold text-slate-800 text-sm mb-1">Chưa chọn bản thảo văn bản</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Điền các ý chính bên trái và bấm phát hành, hoặc chọn một bản soạn thảo có sẵn trong lịch sử để xem và kết xuất nhanh.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-indigo-600 text-xs font-semibold cursor-pointer" onClick={handleCreateNew}>
              Soạn thảo văn bản mới ngay <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
