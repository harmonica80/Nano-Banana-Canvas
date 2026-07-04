import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface ApiKeyModalProps {
  onClose: () => void;
  language: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, language }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY') || '';
    setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem('CUSTOM_GEMINI_API_KEY', trimmed);
    } else {
      localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
    }
    onClose();
    // Force a small page refresh or signal to re-init Gemini client
    window.location.reload();
  };

  const handleClear = () => {
    localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
    setApiKey('');
    setTestStatus('idle');
    setTestMessage('');
    onClose();
    window.location.reload();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage(language === 'zh' ? '請先輸入 API 金鑰才能進行測試' : 'Please enter an API key to test first');
      return;
    }

    setTestStatus('testing');
    setTestMessage(language === 'zh' ? '正在發送測試請求...' : 'Sending test request...');

    try {
      const tempAi = new GoogleGenAI({ apiKey: apiKey.trim() });
      const response = await tempAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hi',
        config: {
          maxOutputTokens: 5
        }
      });

      if (response && response.text) {
        setTestStatus('success');
        setTestMessage(language === 'zh' ? '金鑰測試成功！AI 回應正常。' : 'API Key verified successfully! AI responded correctly.');
      } else {
        throw new Error('No response content');
      }
    } catch (err: any) {
      console.error('Test API Key failed:', err);
      setTestStatus('error');
      const errorMsg = err?.message || JSON.stringify(err);
      setTestMessage(language === 'zh' 
        ? `連線失敗: ${errorMsg}` 
        : `Connection failed: ${errorMsg}`
      );
    }
  };

  const isZh = language === 'zh';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-100 flex flex-col gap-5 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <span>🗝️</span> {isZh ? '自訂 Gemini API 金鑰' : 'Custom Gemini API Key'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isZh 
                ? '解決其他使用者因權限限制產生的 API 錯誤' 
                : 'Solve permission issues or limits for other users'
              }
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 text-xs text-gray-700 flex flex-col gap-2">
          <p className="font-bold text-blue-800 flex items-center gap-1">
            <span>💡</span> {isZh ? '如何免費獲取個人的 API Key？' : 'How to get your free API Key?'}
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-gray-600">
            <li>
              {isZh ? '前往 ' : 'Go to '}
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-600 font-bold hover:underline"
              >
                Google AI Studio
              </a>
            </li>
            <li>{isZh ? '使用您的 Google 帳號登入。' : 'Sign in with your Google Account.'}</li>
            <li>{isZh ? '點選「Get API key」按鈕並建立新金鑰。' : 'Click "Get API key" and create a new key.'}</li>
            <li>{isZh ? '複製該金鑰貼在下方欄位中儲存。' : 'Copy the key and paste it below.'}</li>
          </ol>
          <p className="text-[10px] text-gray-400 mt-1">
            {isZh 
              ? '註：金鑰只會儲存在本機瀏覽器 localStorage，不會上傳至任何第三方伺服器。' 
              : 'Note: The key is stored only in your local browser localStorage and is never uploaded anywhere.'
            }
          </p>
        </div>

        {/* Form Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
            {isZh ? 'API 金鑰 (Key)' : 'API Key'}
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={isZh ? '請輸入或貼上 AIzaSy 開頭的金鑰' : 'Paste your AIzaSy... API key here'}
              className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showKey ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Connection Test Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestKey}
              disabled={testStatus === 'testing'}
              className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isZh ? '測試金鑰連線' : 'Test API Connection'}
            </button>
            {testStatus === 'testing' && (
              <span className="text-xs text-gray-500 animate-pulse">{isZh ? '測試中...' : 'Testing...'}</span>
            )}
          </div>
          {testStatus !== 'idle' && (
            <div className={`p-3 rounded-lg text-xs font-medium border ${
              testStatus === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : testStatus === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}>
              <p className="font-bold flex items-center gap-1 mb-0.5">
                {testStatus === 'success' ? '✅' : '❌'} {isZh ? '測試結果' : 'Test Result'}
              </p>
              <p className="break-all font-mono leading-relaxed">{testMessage}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end border-t border-gray-100 pt-4 mt-1">
          {localStorage.getItem('CUSTOM_GEMINI_API_KEY') && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all sm:mr-auto"
            >
              {isZh ? '清除自訂金鑰 (恢復預設)' : 'Clear Key (Restore Default)'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
          >
            {isZh ? '取消' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm shadow-blue-500/10"
          >
            {isZh ? '儲存並套用' : 'Save & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};
