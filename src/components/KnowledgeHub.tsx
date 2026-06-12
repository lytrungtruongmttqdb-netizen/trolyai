/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { DEFAULT_USER_PROFILE } from '../utils';
import { Save, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface KnowledgeHubProps {
  onProfileChange: (profile: UserProfile) => void;
}

export default function KnowledgeHub({ onProfileChange }: KnowledgeHubProps) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_assistant_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfile(parsed);
      onProfileChange(parsed);
    } else {
      localStorage.setItem('ai_assistant_profile', JSON.stringify(DEFAULT_USER_PROFILE));
      onProfileChange(DEFAULT_USER_PROFILE);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ai_assistant_profile', JSON.stringify(profile));
    onProfileChange(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Bạn có thực sự muốn đặt lại hồ sơ về cài đặt mặc định?')) {
      setProfile(DEFAULT_USER_PROFILE);
      localStorage.setItem('ai_assistant_profile', JSON.stringify(DEFAULT_USER_PROFILE));
      onProfileChange(DEFAULT_USER_PROFILE);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const writingStyles = [
    { value: 'Trang trọng, chuẩn chỉ Nghị định 30/2020-CP, lý luận chặt chẽ', label: 'Hành chính Chuẩn mực (Nghị định 30)' },
    { value: 'Ngắn gọn, dứt khoát, đi vào trọng tâm, ưu tiên hành động', label: 'Quyết đoán & Xử lý nhanh' },
    { value: 'Thuyết phục, ngoại giao, chân thành, xây dựng mối quan hệ', label: 'Ngoại giao & Dân vận' },
    { value: 'Chuyên sâu, đầy đủ số liệu và trích dẫn, mang tính học thuật cao', label: 'Nghiên cứu & Báo cáo chuyên đề' },
  ];

  return (
    <div id="knowledge_hub_pane" className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              HỒ SƠ CÁ NHÂN & PHONG CÁCH VIẾT AI
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Quản lý tri thức cá nhân và cấu hình để Thư ký AI "học" ngữ cảnh công việc của bạn.
            </p>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Đặt lại mặc định
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5"> Họ và tên người dùng <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                value={profile.fullName}
                onChange={e => setProfile({...profile, fullName: e.target.value})}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                placeholder="Ví dụ: Lê Minh Quốc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5"> Chức vụ / Nhiệm vụ <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                value={profile.title}
                onChange={e => setProfile({...profile, title: e.target.value})}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                placeholder="Ví dụ: Chuyên viên Tổng hợp Cao cấp, Giám đốc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5"> Cơ quan / Đơn vị công tác <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                value={profile.agency}
                onChange={e => setProfile({...profile, agency: e.target.value})}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                placeholder="Ví dụ: Văn phòng UBND Tỉnh Quảng Nam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5"> Địa phương làm việc (để cập nhật thời tiết) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                value={profile.location}
                onChange={e => setProfile({...profile, location: e.target.value})}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                placeholder="Ví dụ: Quảng Nam, Hà Nội, Đà Nẵng..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5"> Phong cách soạn thảo của Thư ký AI </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {writingStyles.map((style) => (
                <div 
                  key={style.value}
                  onClick={() => setProfile({...profile, writingStyle: style.value})}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    profile.writingStyle === style.value 
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-medium' 
                      : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700'
                  }`}
                >
                  <p className="text-sm">{style.label}</p>
                  <p className="text-xs text-slate-500 mt-1 font-normal italic">{style.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-700"> Hướng dẫn nghiệp vụ chuyên biệt (Dành riêng cho Thư ký) </label>
              <span className="text-xs text-slate-400">Tự học từ chỉ thị này để soạn báo cáo mẫu chân thực</span>
            </div>
            <textarea 
              rows={4}
              value={profile.customInstructions}
              onChange={e => setProfile({...profile, customInstructions: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors font-sans text-sm"
              placeholder="Nhập ghi chú thói quen của cơ quan, từ vựng hay dùng, phong cách hành văn riêng của Thủ trưởng..."
            />
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2.5 font-medium text-sm transition-all shadow-sm shadow-indigo-100 active:scale-95"
            >
              <Save className="w-4 h-4" />
              Lưu cấu hình Tri thức
            </button>
            {isSaved && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hệ thống thư ký đã ghi nhớ hoàn tất!
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-2">Thủ thuật tối ưu hóa Trợ lý cá nhân:</h3>
        <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
          <li><strong>Soạn thảo văn bản:</strong> Các biểu mẫu Tờ trình, Báo cáo hay Công văn sẽ tự động lấy tên cơ quan (<em>{profile.agency}</em>) và chức danh người soạn thảo (<em>{profile.title}</em>) làm căn cứ chuẩn chỉ đúng văn thư.</li>
          <li><strong>Xưng hô trong trò chuyện:</strong> Trợ lý AI sẽ tinh chỉnh ngôn từ trang trọng, chuẩn cán bộ cấp cao khi đàm thoại và gợi ý xử lý ưu tiên.</li>
          <li><strong>Bản tin sáng:</strong> Cập nhật vị trí (<em>{profile.location}</em>) giúp Gemini lập đề xuất mang ô, cảnh báo chỉ số UV và lấy phong cảnh vùng miền phù hợp.</li>
        </ul>
      </div>
    </div>
  );
}
