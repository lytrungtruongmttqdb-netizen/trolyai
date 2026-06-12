/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TaskItem, EisenhowerCategory, UserProfile } from '../types';
import { DEFAULT_TASKS } from '../utils';
import { parseMarkdownToHtml } from '../utils';
import { Plus, Trash2, CheckCircle2, Clock, Calendar, Sparkles, Loader2, AlertTriangle, Play, HelpCircle, Check, Info } from 'lucide-react';

interface TaskBoardProps {
  userProfile: UserProfile;
  tasks: TaskItem[];
  onTasksChange: (tasks: TaskItem[]) => void;
}

const CATEGORIES: { value: EisenhowerCategory; title: string; color: string; desc: string }[] = [
  { 
    value: 'urgent-important', 
    title: 'Khẩn cấp & Quan trọng', 
    color: 'bg-red-50 border-red-200 text-red-950 accent-red-600',
    desc: 'Làm ngay lập tức - Các khủng hoàng, việc sát hạn chót' 
  },
  { 
    value: 'important-not-urgent', 
    title: 'Quan trọng - Không khẩn cấp', 
    color: 'bg-blue-50 border-blue-200 text-blue-950 accent-blue-600',
    desc: 'Lên lịch thực hiện - Việc lập kế hoạch, phát triển năng lực' 
  },
  { 
    value: 'urgent-not-important', 
    title: 'Khẩn cấp - Ít quan trọng', 
    color: 'bg-amber-50 border-amber-200 text-amber-950 accent-amber-600',
    desc: 'Ủy quyền / Sắp xếp lại - Việc phát sinh đột xuất, thư từ ít khẩn' 
  },
  { 
    value: 'normal', 
    title: 'Công việc thường xuyên / Bình thường', 
    color: 'bg-slate-50 border-slate-200 text-slate-800 accent-slate-600',
    desc: 'Thực hiện tuần tự - Giải quyết trong thời gian rảnh, thói quen' 
  }
];

export default function TaskBoard({ userProfile, tasks, onTasksChange }: TaskBoardProps) {
  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<EisenhowerCategory>('urgent-important');
  const [newDueDate, setNewDueDate] = useState('');
  
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_assistant_tasks');
    if (saved) {
      onTasksChange(JSON.parse(saved));
    } else {
      localStorage.setItem('ai_assistant_tasks', JSON.stringify(DEFAULT_TASKS));
      onTasksChange(DEFAULT_TASKS);
    }
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      progress: 0,
      isCompleted: false
    };

    const updated = [...tasks, newTask];
    onTasksChange(updated);
    localStorage.setItem('ai_assistant_tasks', JSON.stringify(updated));
    
    // Clear form
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
  };

  const handleToggleCompleted = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextState = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextState,
          progress: nextState ? 100 : t.progress === 100 ? 50 : t.progress
        };
      }
      return t;
    });

    onTasksChange(updated);
    localStorage.setItem('ai_assistant_tasks', JSON.stringify(updated));
  };

  const handleProgressChange = (id: string, progress: number) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          progress,
          isCompleted: progress === 100
        };
      }
      return t;
    });

    onTasksChange(updated);
    localStorage.setItem('ai_assistant_tasks', JSON.stringify(updated));
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Bạn có muốn xóa công việc này?')) {
      const updated = tasks.filter(t => t.id !== id);
      onTasksChange(updated);
      localStorage.setItem('ai_assistant_tasks', JSON.stringify(updated));
    }
  };

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    try {
      const response = await fetch('/api/analyze-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks,
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error('Không thể phân tích Eisenhower');
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (err: any) {
      console.error(err);
      setAiAnalysis(`❌ Lỗi kết nối: Không thể chạy phân tích hiệu suất bằng AI. Đảm bảo GEMINI_API_KEY đã được thiết lập chính xác.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgentBadgeClass = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50';
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return 'bg-red-100 text-red-800 animate-pulse';
    if (days <= 2) return 'bg-amber-100 text-amber-800';
    return 'bg-slate-100 text-slate-600';
  };

  const getUrgentLabel = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) return 'Đã xong';
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return `Trễ ${Math.abs(days)} ngày`;
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Ngày mai';
    return `Còn ${days} ngày`;
  };

  return (
    <div id="tasks_workspace" className="space-y-6">
      {/* Top action grid: Add task form + AI diagnostic insight loader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Form add task */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Plus className="w-5 h-5 text-indigo-600" />
            Bổ sung nhiệm vụ mới
          </h3>
          <form onSubmit={handleAddTask} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-0.5">Tiêu đề công việc</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Rà soát Đè án Chuyển đổi số quận..."
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-0.5">Mô tả tóm lược</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Các ý chỉ đạo chính, số lượng hồ sơ, các cơ quan ban ngành phối hợp..."
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Ưu tiên (Eisenhower)</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as EisenhowerCategory)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-2 text-slate-800 focus:border-indigo-600 cursor-pointer"
                >
                  <option value="urgent-important">Khẩn cấp & Quan trọng</option>
                  <option value="important-not-urgent">Quan trọng - Không khẩn</option>
                  <option value="urgent-not-important">Khẩn cấp - Ít quan trọng</option>
                  <option value="normal">Thường xuyên - Bình thường</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Hạn chót (Deadline)</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-2 text-slate-800 focus:border-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              Thêm vào Ma trận Công việc
            </button>
          </form>
        </div>

        {/* AI diagnostic report card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-bold text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Chẩn đoán và Phân bổ Công việc bởi AI
            </h3>
            <button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 px-3 py-1.5 rounded-lg font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang chạy rà soát...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  Chạy AI chẩn đoán
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[170px] border border-slate-100 bg-slate-50/50 rounded-lg p-3 text-xs leading-relaxed text-slate-700">
            {aiAnalysis ? (
              <div 
                className="markdown-body text-slate-700" 
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(aiAnalysis) }}
              />
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center py-6 text-slate-400">
                <Info className="w-6 h-6 mb-1 text-slate-300" />
                Đồng chí chưa chạy chẩn đoán AI ngày hôm nay.
                <p className="text-[10px] text-slate-400 mt-1">Bấm nút "Chạy AI chẩn đoán" để quét quá tải, đề xuất ủy quyền và thiết lập lại 3 nhiệm vụ rốt ráo ngày hôm nay.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Eisenhower grid board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => {
          const categoryTasks = tasks.filter(t => t.category === cat.value);
          const completedCount = categoryTasks.filter(t => t.isCompleted).length;
          
          return (
            <div 
              key={cat.value}
              className={`border rounded-xl p-5 shadow-sm transition-all hover:shadow-md ${cat.color}`}
            >
              <div className="flex justify-between items-start border-b border-slate-200/55 pb-3 mb-4">
                <div>
                  <h4 className="font-bold font-display text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
                    {cat.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</p>
                </div>
                <span className="bg-white/90 text-[10px] text-slate-600 font-semibold px-2 py-0.5 border border-slate-200 rounded-full">
                  Xong {completedCount}/{categoryTasks.length}
                </span>
              </div>

              {categoryTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic bg-white/40 border border-dashed border-slate-200/50 rounded-lg">
                  Không có đầu mục nhiệm vụ nào thuộc nhóm này.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                  {categoryTasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow transition-all relative group ${
                        task.isCompleted ? 'border-slate-200 opacity-65' : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {/* Flex header */}
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => handleToggleCompleted(task.id)}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded p-0.5 shrink-0 transition-all mt-0.5"
                          >
                            <Check className={`w-3.5 h-3.5 ${task.isCompleted ? 'text-emerald-600 opacity-100' : 'text-slate-300 opacity-20 hover:opacity-100'}`} />
                          </button>
                          <div>
                            <h5 className={`text-xs font-bold text-slate-800 leading-normal ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>
                              {task.title}
                            </h5>
                            {task.description && (
                              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-slate-300 hover:text-red-500 p-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Stats and inputs footer */}
                      <div className="border-t border-slate-100 mt-2.5 pt-2 flex items-center justify-between flex-wrap gap-2">
                        {/* Progress slider bar */}
                        <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                          <span className="text-[9px] font-semibold text-slate-400 shrink-0">{task.progress}%</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={task.progress}
                            onChange={(e) => handleProgressChange(task.id, parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 shrink-1"
                          />
                        </div>

                        {/* Deadline card */}
                        <div className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${getUrgentBadgeClass(task.dueDate, task.isCompleted)}`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{getUrgentLabel(task.dueDate, task.isCompleted)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
