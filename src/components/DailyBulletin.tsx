/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NewsBulletin, UserProfile, TaskItem } from '../types';
import { DEFAULT_BULLETIN_DATA } from '../utils';
import { Sun, CloudRain, ShieldAlert, Sparkles, RefreshCw, Calendar, CheckSquare, Newspaper, MapPin, Wind, Thermometer, Droplets, Loader2, ArrowRight } from 'lucide-react';

interface DailyBulletinProps {
  userProfile: UserProfile;
  tasks: TaskItem[];
  bulletin: NewsBulletin | null;
  onBulletinChange: (bulletin: NewsBulletin) => void;
}

export default function DailyBulletin({ userProfile, tasks, bulletin, onBulletinChange }: DailyBulletinProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_assistant_bulletin');
    if (saved) {
      onBulletinChange(JSON.parse(saved));
    } else {
      localStorage.setItem('ai_assistant_bulletin', JSON.stringify(DEFAULT_BULLETIN_DATA));
      onBulletinChange(DEFAULT_BULLETIN_DATA);
    }
  }, []);

  const handleRefreshBulletin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/bulletin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          customPrompt: customPrompt.trim() || 'Cập nhật bản tin hành chính tổng hợp hàng ngày.'
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi cập nhật bản tin');
      }

      const data = await response.json();
      onBulletinChange(data);
      localStorage.setItem('ai_assistant_bulletin', JSON.stringify(data));
      setCustomPrompt('');
    } catch (err: any) {
      console.error(err);
      alert('Không thể cập nhật Bản tin sáng. Vui lòng rà soát cấu hình GEMINI_API_KEY trong Settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const data = bulletin || DEFAULT_BULLETIN_DATA;

  // Choose fitting icons for weather recommendation
  const isHot = data.weather.temperature.includes('3') || parseInt(data.weather.temperature) > 30;

  return (
    <div id="morning_bulletin_dashboard" className="space-y-6">
      {/* Banner Header with custom search/prompt target */}
      <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 opacity-10 font-black text-9xl tracking-tighter select-none font-display transform translate-x-12 -translate-y-12">
          NEWS
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="bg-indigo-500 font-semibold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded">
                Ấn phẩm điều hành 07:00 AM
              </span>
              <h2 className="text-xl md:text-2xl font-black font-display tracking-tight mt-1.5 flex items-center gap-2">
                BẢN TIN SÁNG & ĐIỀU HÀNH DIỆN HỘP
              </h2>
              <p className="text-slate-400 text-xs mt-1 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {data.date} — Biên soạn cho {userProfile.fullName} ({userProfile.title})
              </p>
            </div>

            {/* Custom AI prompt generation form */}
            <form onSubmit={handleRefreshBulletin} className="flex gap-2 items-center w-full md:w-auto">
              <input
                type="text"
                disabled={isLoading}
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                placeholder="Nhập trọng tâm đặc biệt ví dụ: cải cách công Quảng Nam..."
                className="bg-white/10 text-white placeholder-slate-400 text-xs rounded-lg px-3.5 py-2 w-full md:w-[260px] border border-white/10 focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Tái lập AI
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Widget 1: Weather cards summary */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Chỉ số thời tiết tỉnh thành — {data.weather.location || userProfile.location}
            </h3>

            <div className="grid grid-cols-2 gap-3.5 mb-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center gap-3">
                <Thermometer className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Nhiệt độ dự báo</p>
                  <p className="text-sm font-black text-slate-900">{data.weather.temperature}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center gap-3">
                <Sun className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Chỉ số cực tím UV</p>
                  <p className="text-xs font-bold text-slate-900">{data.weather.uvIndex.split(' ')[0]} <span className="text-[10px] font-normal text-slate-500">({data.weather.uvIndex.split(' ')[1] || 'Cao'})</span></p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center gap-3">
                <Droplets className="w-8 h-8 text-indigo-500" />
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Độ ẩm tương đối</p>
                  <p className="text-sm font-bold text-slate-900">{data.weather.humidity}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center gap-3">
                <Wind className="w-8 h-8 text-teal-500" />
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Chất lượng khí AQI</p>
                  <p className="text-xs font-bold text-slate-900">{data.weather.airQuality.split(' ')[0]} <span className="text-[10px] font-normal text-slate-500">({data.weather.airQuality.split(' ')[1] || 'Tốt'})</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-3.5 flex items-start gap-2.5">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-950">Khuyến nghị Y tế hành trình:</h4>
              <p className="text-[10px] text-amber-900 leading-relaxed mt-1">{data.weather.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Widget 2: Today's Agenda list from Eisenhower tasks */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Sổ tay công tác ngày hôm nay ({activeTasks.length})
            </h3>

            {activeTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                Tuyệt vời! Toàn bộ công việc của lãnh đạo đã được giải quyết hoặc chưa lập lịch.
              </div>
            ) : (
              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                {activeTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        task.category === 'urgent-important' ? 'bg-red-500' :
                        task.category === 'important-not-urgent' ? 'bg-blue-500' : 'bg-amber-500'
                      }`} />
                      <p className="text-xs font-bold text-slate-800 truncate">{task.title}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{task.dueDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeTasks.length > 4 && (
            <div className="text-right text-[10px] font-semibold text-indigo-600 mt-2">
              và còn {activeTasks.length - 4} việc khẩn cấp khác cần rà soát...
            </div>
          )}
        </div>
      </div>

      {/* Curated Category News Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-black text-slate-950 font-display flex items-center gap-2 border-b border-slate-100 pb-4 mb-6 text-base">
          <Newspaper className="w-5 h-5 text-indigo-600" />
          BẢN TIN CHUYỂN ĐỔI SỐ - PHÁP CHẾ & THỜI SỰ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.news.map((item, idx) => (
            <div key={idx} className="border border-slate-100 bg-slate-50/50 p-4 rounded-lg flex flex-col justify-between hover:shadow-sm transition-all">
              <div>
                <span className="bg-slate-900 text-white font-semibold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                  {item.category}
                </span>
                <h4 className="font-bold text-slate-900 text-xs mt-2.5 leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-2">
                  {item.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
