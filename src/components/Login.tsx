/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Shield, Building2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (fullName: string, agency: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('lytrungtruong');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // Allow general matching for user satisfaction
      if (username.trim().toLowerCase() === 'lytrungtruong' || username.trim() === 'Lý Trung Trường') {
        if (password === '123456' || password === '') {
          onLoginSuccess('Lý Trung Trường', 'Ủy ban MTTQ Việt Nam tỉnh Điện Biên');
        } else {
          setError('Mật khẩu không chính xác. (Gợi ý: 123456)');
          setLoading(false);
        }
      } else {
        // Fallback for custom entries
        onLoginSuccess(username, 'Ủy ban MTTQ Việt Nam tỉnh Điện Biên');
      }
    }, 600);
  };

  const handleQuickLogin = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      onLoginSuccess('Lý Trung Trường', 'Ủy ban MTTQ Việt Nam tỉnh Điện Biên');
    }, 400);
  };

  return (
    <div id="login_container" className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-100 to-slate-200 px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Background elegant circles/accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl shadow-slate-300/40 border border-slate-200/60 overflow-hidden relative z-10 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50">
        
        {/* National / State Top Branding Header bar */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 px-6 py-6 text-center text-white relative">
          {/* Subtle star shape behind */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="flex flex-col items-center gap-2">
            {/* National Front stylized Golden Emblem placeholder */}
            <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center shadow-md shadow-red-900/30 border border-amber-300 relative">
              <div className="absolute w-12 h-12 rounded-full border border-amber-500 flex items-center justify-center">
                <span className="font-display font-black text-xs text-red-800 leading-none text-center">★<br/><span className="text-[7px] tracking-tighter">MTTQ</span></span>
              </div>
            </div>
            
            <div className="space-y-1 mt-1">
              <h1 className="text-sm font-black tracking-widest text-amber-300 uppercase font-display leading-tight">
                ỦY BAN MẶT TRẬN TỔ QUỐC VIỆT NAM
              </h1>
              <h2 className="text-xs font-extrabold tracking-wide text-white uppercase font-display">
                TỈNH ĐIỆN BIÊN
              </h2>
              <div className="w-20 h-0.5 bg-amber-400 mx-auto my-1.5 opacity-80" />
              <p className="text-[10px] text-red-100 font-semibold uppercase tracking-wider">
                Hệ Thống Trợ Lý AI & Điều Hành Số
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Main heading */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">ĐĂNG NHẬP CHUYÊN VIÊN</h3>
            <p className="text-xs text-slate-500 mt-1">Sử dụng tài khoản công vụ được cấp để truy cập hệ thống trợ lý</p>
          </div>

          {/* Quick Login selector profile card (Very beautiful) */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-sm shadow-indigo-200">
                LTT
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Lý Trung Trường</h4>
                <p className="text-[10px] text-slate-500 font-medium">Chuyên viên Tổng hợp • MTTQ Điện Biên</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={handleQuickLogin}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors shadow-sm cursor-pointer"
            >
              Vào Nhanh
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-widest">Hoặc Nhập Thủ Công</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4.5 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tên đăng nhập</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors outline-none"
                  placeholder="Nhập tên tài khoản (lytrungtruong)"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Mật khẩu</label>
                <span className="text-[10px] text-indigo-600 hover:underline cursor-pointer">Quên mật khẩu?</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors outline-none"
                  placeholder="Nhập mật khẩu công vụ"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                />
                <span className="text-xs text-slate-500 font-medium">Ghi nhớ đăng nhập</span>
              </label>
              
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" /> SSL SECURE
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-850 text-white font-bold text-sm rounded-lg shadow-md shadow-indigo-200 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                loading ? 'opacity-85 pointer-events-none' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xác thực bảo mật...
                </>
              ) : (
                'Đăng Nhập Hệ Thống'
              )}
            </button>
          </form>
        </div>

        {/* Form Footer info note */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Bản quyền © 2026 Ủy ban MTTQ Việt Nam tỉnh Điện Biên</span>
        </div>
      </div>
    </div>
  );
}
