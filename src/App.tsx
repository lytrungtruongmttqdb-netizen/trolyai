/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProfile, TaskItem, NewsBulletin } from './types';
import { DEFAULT_USER_PROFILE, DEFAULT_TASKS, DEFAULT_BULLETIN_DATA } from './utils';

// Import Tab Components
import DailyBulletin from './components/DailyBulletin';
import DocumentWizard from './components/DocumentWizard';
import TaskBoard from './components/TaskBoard';
import MeetingManager from './components/MeetingManager';
import AISec from './components/AISec';
import KnowledgeHub from './components/KnowledgeHub';
import IntegrationTester from './components/IntegrationTester';
import Login from './components/Login';

// Import Icons
import { 
  Newspaper, 
  FileText, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  Share2, 
  Search, 
  Bell, 
  Menu, 
  X,
  BookOpen
} from 'lucide-react';

type TabID = 'bulletin' | 'draft' | 'tasks' | 'meetings' | 'chat' | 'knowledge' | 'integration';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabID>('bulletin');
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [bulletin, setBulletin] = useState<NewsBulletin | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ai_assistant_is_logged_in') === 'true';
  });

  // Load profile, tasks and bulletin from localStorage on app bootstrap
  useEffect(() => {
    const savedProfile = localStorage.getItem('ai_assistant_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    const savedTasks = localStorage.getItem('ai_assistant_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    const savedBulletin = localStorage.getItem('ai_assistant_bulletin');
    if (savedBulletin) {
      setBulletin(JSON.parse(savedBulletin));
    } else {
      setBulletin(DEFAULT_BULLETIN_DATA);
    }
  }, []);

  const handleProfileChange = (updated: UserProfile) => {
    setUserProfile(updated);
  };

  const handleTasksChange = (updated: TaskItem[]) => {
    setTasks(updated);
  };

  const handleBulletinChange = (updated: NewsBulletin) => {
    setBulletin(updated);
  };

  // Nav definitions
  const NAVIGATION_ITEMS: { id: TabID; label: string; desc: string; icon: any }[] = [
    { 
      id: 'bulletin', 
      label: 'Bản Tin Sáng', 
      desc: 'Báo cáo 07:00 AM & Dự báo thời tiết',
      icon: Newspaper 
    },
    { 
      id: 'draft', 
      label: 'Soạn Thảo Văn Bản', 
      desc: 'Công văn, Nghị quyết, Tờ trình chuẩn 30',
      icon: FileText 
    },
    { 
      id: 'tasks', 
      label: 'Ma Trận Công Việc', 
      desc: 'Ưu tiên thông minh Eisenhower',
      icon: CheckSquare 
    },
    { 
      id: 'meetings', 
      label: 'Nhật Trình Lịch Họp', 
      desc: 'Tóm lược biểu biểu đồ phân công AI',
      icon: Calendar 
    },
    { 
      id: 'chat', 
      label: 'Thư Ký AI Trò Chuyện', 
      desc: 'Bản tin số hóa, đàm thoại lãnh đạo',
      icon: MessageSquare 
    },
    { 
      id: 'knowledge', 
      label: 'Tri Thức Cá Nhân', 
      desc: 'Hồ sơ lý lịch, cách viết của AI',
      icon: BookOpen 
    },
    { 
      id: 'integration', 
      label: 'Cổng Liên Thông', 
      desc: 'Kết nối webhook n8n, Zalo, Make',
      icon: Share2 
    },
  ];

  if (!isLoggedIn) {
    return (
      <Login 
        onLoginSuccess={(name, agency) => {
          localStorage.setItem('ai_assistant_is_logged_in', 'true');
          const updatedProfile = {
            ...userProfile,
            fullName: name || 'Lý Trung Trường',
            agency: agency || 'Ủy ban MTTQ Việt Nam tỉnh Điện Biên'
          };
          setUserProfile(updatedProfile);
          localStorage.setItem('ai_assistant_profile', JSON.stringify(updatedProfile));
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  return (
    <div id="executive_agency_shell" className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      
      {/* Sidebar navigation backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden no-print"
        />
      )}

      {/* Primary Left Sidebar Navigation Drawer */}
      <aside className={`fixed lg:relative inset-y-0 left-0 bg-slate-950 text-slate-100 w-[280px] z-40 transform transition-transform duration-300 ease-in-out border-r border-slate-800/40 lg:translate-x-0 flex flex-col justify-between shrink-0 no-print ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Brand header */}
          <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-display font-medium text-amber-300 text-xs shadow-inner">
                ★
              </div>
              <div className="overflow-hidden">
                <h3 className="font-extrabold text-[11px] tracking-tight font-display text-white truncate">MTTQ TỈNH ĐIỆN BIÊN</h3>
                <p className="text-[8px] text-amber-400 font-bold tracking-wider uppercase truncate">Trợ lý điều hành AI</p>
              </div>
            </div>
            
            {/* Mobile close trigger */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 hover:bg-slate-900 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User brief card */}
          <div className="p-4 mx-2 mt-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 text-white/5 font-black text-6xl tracking-tighter select-none font-display transform translate-x-2 -translate-y-2">
              VP
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Chào ngày mới, thưa</p>
            <h4 className="font-bold text-xs truncate mt-0.5 text-white">{userProfile.fullName}</h4>
            <span className="inline-block bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold mt-1.5 truncate max-w-full">
              {userProfile.title}
            </span>
          </div>

          {/* Navigation menus */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer relative group ${
                    isActive 
                      ? 'bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-950/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <div className="overflow-hidden">
                    <div className="text-xs">{item.label}</div>
                    <div className={`text-[9px] font-normal truncate mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </div>
                  {isActive && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white font-bold inline-block" />
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Footer brand standard */}
        <div className="p-4 border-t border-white/5 text-[9px] text-slate-500 font-mono text-center flex flex-col gap-1 items-center justify-center">
          <p className="font-bold text-slate-400 text-[10px]">ỦY BAN MTTQ ĐIỆN BIÊN</p>
          <p className="text-slate-600">Bảo mật dữ liệu công vụ</p>
          <button 
            onClick={() => {
              localStorage.removeItem('ai_assistant_is_logged_in');
              setIsLoggedIn(false);
            }}
            className="mt-1 px-2.5 py-0.5 bg-red-950/40 border border-red-850/50 hover:bg-red-900/40 hover:text-red-200 text-red-400 font-bold rounded text-[9px] transition-colors cursor-pointer"
          >
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main viewport Container area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top bar header */}
        <header className="h-16 bg-white border-b border-slate-200/60 px-6 flex items-center justify-between sticky top-0 z-20 no-print shadow-sm">
          <div className="flex items-center gap-3">
            {/* Burger triggers for mobile drawer */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="sm:flex items-center gap-2 text-slate-400 hidden text-xs font-semibold select-none">
              <span>Hệ thống Công vụ Số</span>
              <span>/</span>
              <span className="text-slate-800 font-bold uppercase">{NAVIGATION_ITEMS.find(n => n.id === activeTab)?.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-4.5">
            {/* Quick clock widget */}
            <div className="text-right sm:block hidden">
              <span className="block text-[11px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Bản cập nhật thời gian thực</span>
            </div>

            {/* Notification placeholder */}
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 cursor-pointer relative hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
          </div>
        </header>

        {/* Main interactive Tab Render zone */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in pb-16">
          {activeTab === 'bulletin' && (
            <DailyBulletin 
              userProfile={userProfile} 
              tasks={tasks} 
              bulletin={bulletin}
              onBulletinChange={handleBulletinChange}
            />
          )}

          {activeTab === 'draft' && (
            <DocumentWizard 
              userProfile={userProfile} 
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard 
              userProfile={userProfile} 
              tasks={tasks} 
              onTasksChange={handleTasksChange}
            />
          )}

          {activeTab === 'meetings' && (
            <MeetingManager 
              userProfile={userProfile} 
            />
          )}

          {activeTab === 'chat' && (
            <AISec 
              userProfile={userProfile} 
              tasks={tasks}
              bulletin={bulletin}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeHub 
              onProfileChange={handleProfileChange}
            />
          )}

          {activeTab === 'integration' && (
            <IntegrationTester />
          )}
        </main>
      </div>

    </div>
  );
}
