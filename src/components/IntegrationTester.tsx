/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { IntegrationConfigs } from '../types';
import { DEFAULT_INTEGRATIONS } from '../utils';
import { Share2, Settings, Mail, Send, Compass, ExternalLink, RefreshCw, CheckCircle, AlertCircle, HelpCircle, ToggleLeft, ToggleRight, Sparkles, Server } from 'lucide-react';

export default function IntegrationTester() {
  const [configs, setConfigs] = useState<IntegrationConfigs>(DEFAULT_INTEGRATIONS);
  const [isSaved, setIsSaved] = useState(false);
  
  // Test webhook trigger state
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [testResultMsg, setTestResultMsg] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_integration_configs');
    if (saved) {
      setConfigs(JSON.parse(saved));
    } else {
      localStorage.setItem('ai_integration_configs', JSON.stringify(DEFAULT_INTEGRATIONS));
      setConfigs(DEFAULT_INTEGRATIONS);
    }
  }, []);

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ai_integration_configs', JSON.stringify(configs));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTriggerWebhookTest = async () => {
    if (!configs.webhookUrl) {
      alert('Vui lòng điền URL Webhook của bạn thiết lập trước khi gửi tín hiệu test!');
      return;
    }

    setIsTesting(true);
    setTestSuccess(null);
    setTestResultMsg('');

    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: configs.webhookUrl,
          payload: {
            message: 'Tín hiệu tự động từ Trợ Lý AI Điều Hành Cao Cấp',
            status: 'ONLINE',
            details: 'Hệ thống kiểm tra luồng n8n / Make.com / Zapier liên thông chuẩn chỉ.',
            testTime: new Date().toLocaleString('vi-VN'),
          }
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTestSuccess(true);
        setTestResultMsg(data.message || 'Gửi test webhook thành công rực rỡ!');
      } else {
        setTestSuccess(false);
        setTestResultMsg(data.error || 'Webhook trả về lỗi kết nối.');
      }
    } catch (err: any) {
      console.error(err);
      setTestSuccess(false);
      setTestResultMsg(`Cảnh báo kết nối: ${err.message || 'Không thể liên lạc tới máy chủ webhook'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div id="integrations_panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[calc(100vh-200px)]">
      {/* Left panel: Form setups */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-100 bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-display flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Cấu hình Kết nối & Tự động hóa
          </h3>
          {isSaved && (
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
              Đã lưu thay đổi!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveConfigs} className="space-y-4 text-xs text-slate-700">
          {/* Gmail toggle */}
          <div className="border border-slate-100 p-3.5 rounded-lg bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                <Mail className="w-4 h-4 text-red-500" />
                Gmail / Email báo thâm nhập tự động
              </span>
              <button
                type="button"
                onClick={() => setConfigs({ ...configs, gmailEnabled: !configs.gmailEnabled })}
                className="text-slate-600 cursor-pointer"
              >
                {configs.gmailEnabled ? <ToggleRight className="w-7 h-7 text-indigo-600" /> : <ToggleLeft className="w-7 h-7 text-slate-300" />}
              </button>
            </div>
            {configs.gmailEnabled && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Địa chỉ Email nhận báo cáo tóm tắt sáng</label>
                <input
                  type="email"
                  value={configs.gmailEmail}
                  onChange={e => setConfigs({ ...configs, gmailEmail: e.target.value })}
                  placeholder="name@agency.com"
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus:border-indigo-600"
                />
              </div>
            )}
          </div>

          {/* Telegram bot settings */}
          <div className="border border-slate-100 p-3.5 rounded-lg bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                <Send className="w-4 h-4 text-sky-500" />
                Telegram Bot gửi cảnh báo bão / việc khẩn cấp
              </span>
              <button
                type="button"
                onClick={() => setConfigs({ ...configs, telegramEnabled: !configs.telegramEnabled })}
                className="text-slate-600 cursor-pointer"
              >
                {configs.telegramEnabled ? <ToggleRight className="w-7 h-7 text-indigo-600" /> : <ToggleLeft className="w-7 h-7 text-slate-300" />}
              </button>
            </div>
            {configs.telegramEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Bot Token</label>
                  <input
                    type="password"
                    value={configs.telegramBotToken}
                    onChange={e => setConfigs({ ...configs, telegramBotToken: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Chat ID / Group ID</label>
                  <input
                    type="text"
                    value={configs.telegramChatId}
                    onChange={e => setConfigs({ ...configs, telegramChatId: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus:border-indigo-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Webhook tester settings */}
          <div className="border border-slate-100 p-3.5 rounded-lg bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                <Server className="w-4 h-4 text-emerald-500" />
                Webhook luồng tự động (n8n / Make.com / Zapier)
              </span>
              <button
                type="button"
                onClick={() => setConfigs({ ...configs, webhookEnabled: !configs.webhookEnabled })}
                className="text-slate-600 cursor-pointer"
              >
                {configs.webhookEnabled ? <ToggleRight className="w-7 h-7 text-indigo-600" /> : <ToggleLeft className="w-7 h-7 text-slate-300" />}
              </button>
            </div>
            {configs.webhookEnabled && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">URL Nhận dữ liệu (POST Request)</label>
                <input
                  type="url"
                  value={configs.webhookUrl}
                  onChange={e => setConfigs({ ...configs, webhookUrl: e.target.value })}
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus:border-indigo-600"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 border border-slate-900 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-all active:scale-[0.98]"
          >
            Lưu thay đổi Cấu hình
          </button>
        </form>
      </div>

      {/* Right panel: Testing ground console */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
            <Share2 className="w-4.5 h-4.5 text-indigo-600" />
            Nhật ký Chạy Thử Webhook & Phản hồi
          </h3>

          <div className="bg-slate-950 text-slate-200 font-mono text-[10px] p-4 rounded-lg overflow-x-auto min-h-[160px] space-y-2 shadow-inner">
            <p className="text-slate-500">// Bấm Gửi tín hiệu để chạy thử cổng Proxy liên thông //</p>
            {isTesting && <p className="text-indigo-400 animate-pulse">&gt; Sắp gửi payload POST lên: {configs.webhookUrl}...</p>}
            
            {testSuccess === true && (
              <div className="text-emerald-400 space-y-1">
                <p>&gt; [SUCCESS] Trạng thái: 200 OK</p>
                <p>&gt; Phản hồi: {testResultMsg}</p>
                <p>&gt; Sự kiện: AI_EXECUTIVE_ASSISTANT_TEST_TRIGGER</p>
              </div>
            )}

            {testSuccess === false && (
              <div className="text-red-400 space-y-1">
                <p>&gt; [ERROR] Gửi cổng kết nối thất bại.</p>
                <p>&gt; Lỗi: {testResultMsg}</p>
                <p>&gt; Vui lòng cấu hình webhook thực tế của n8n hoặc Make để hứng payload.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <button
            onClick={handleTriggerWebhookTest}
            disabled={isTesting || !configs.webhookUrl}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95 animate-fade-in"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            Kích hoạt Gửi tín hiệu Test
          </button>

          <div className="border border-slate-100 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-500 leading-relaxed space-y-1">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              Sơ đồ Tự động hóa liên kết thông minh:
            </div>
            <p><strong>1. Trợ lý AI sinh báo cáo</strong> &rarr; <strong>2. Nhấn Gửi test</strong> &rarr; <strong>3. Webhook liên thông n8n/Make</strong> &rarr; <strong>4. Tự động đẩy qua Telegram Group / lưu Google Drive / tạo ticket công việc.</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
