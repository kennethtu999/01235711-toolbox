'use client';

import { useState } from 'react';
import { LayoutType } from './LayoutToggle';
import JsonPreview from '../JsonPreview';

interface JsonFormatterProps {
  layout?: LayoutType;
}


export default function JsonFormatter({ layout = 'horizontal' }: JsonFormatterProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const isJson = (input: string) => {
    try {
      JSON.parse(input);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 輔助函數：安全地解析 JSON，支援處理被字串化的 JSON
  const parseJsonSafely = (input: string) => {
    if (!input) {
      return {};
    } else if (isJson(input)) {
        return JSON.parse(input);
    }
      
    try {
      let input1 = input.trim().replace(/^[^{]*{(.*)}[^}]*$/, '{$1}');
      let input2 = input.trim().replace(/^[^\[]]*[(.*)]}[^\]]*$/, '[$1]');
      if (input1 && input2) {
        input = input1.length > input2.length ? input1 : input2;
      } else {
        input = input1 || input2 || input;
      }

      if (isJson(input)) {
        return JSON.parse(input);
      }

      // 嘗試先去掉最外層的引號（某些被錯誤包裹的字串）
      input = input1.trim().replace(/^\s*"(.*)"\s*,?\s*$/, '$1').replace(/\\"/g, '"');
        
      // 嘗試第一層解析
      let parsed = JSON.parse(input);
    
      // 如果結果還是字串（說明是雙層轉義），再解析一次
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
  
      return parsed;
    } catch (e) {
      console.error("解析失敗:", e);
      throw new Error("Invalid JSON input");
    }
  };

  const formatJson = () => {
    try {
      setError('');
      const parsed = parseJsonSafely(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
    } catch (err) {
      setError(`JSON 格式錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      setError('');
      const parsed = parseJsonSafely(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
    } catch (err) {
      setError(`JSON 格式錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      setOutput('');
    }
  };

  const validateJson = () => {
    try {
      parseJsonSafely(input);
      setError('');
      alert('JSON 格式正確！');
    } catch (err) {
      setError(`JSON 格式錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const downloadJson = () => {
    if (!output) {
      alert('請先格式化 JSON');
      return;
    }

    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!output) {
      alert('請先格式化 JSON');
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      alert('已複製到剪貼簿');
    } catch (err) {
      alert('複製失敗');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">JSON 格式化工具</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={formatJson}
              className="btn-sm-primary"
            >
              格式化
            </button>
            <button
              onClick={minifyJson}
              className="btn-sm-secondary"
            >
              壓縮
            </button>
            <button
              onClick={validateJson}
              className="btn-sm-secondary"
            >
              驗證
            </button>
            <button
              onClick={copyToClipboard}
              className="btn-sm-secondary"
              disabled={!output}
            >
              複製
            </button>
            <button
              onClick={downloadJson}
              className="btn-sm-primary"
              disabled={!output}
            >
              下載
            </button>
            <button
              onClick={clearAll}
              className="btn-sm-danger"
            >
              清除
            </button>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${layout === 'horizontal' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* 輸入區域 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            輸入 JSON 
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此輸入 JSON 資料..."
            className="form-input h-96 font-mono text-sm"
            style={{ resize: 'none' }}
          />
        </div>

        {/* 輸出區域 */}
        <div>
          <JsonPreview
            title="格式化結果"
            content={output}
            placeholder="格式化後的 JSON 將顯示在此處..."
          />
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 使用說明 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-900 mb-2">使用說明</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 在輸入框中貼上或輸入 JSON 資料</li>
          <li>• 支援直接的 JSON 格式和被字串化的 JSON（如 API 回應中的字串）</li>
          <li>• 點擊「格式化」按鈕美化 JSON 格式</li>
          <li>• 點擊「壓縮」按鈕移除所有空格和換行</li>
          <li>• 點擊「驗證」按鈕檢查 JSON 格式是否正確</li>
          <li>• 可以複製結果到剪貼簿或下載為 .json 檔案</li>
          <li>• 使用布局切換按鈕調整輸入輸出區域的排列方式</li>
        </ul>
      </div>
    </div>
  );
} 