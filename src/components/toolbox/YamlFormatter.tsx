'use client';

import { useState } from 'react';
import * as yaml from 'yaml'; // 替換為 yaml 函式庫

import { LayoutType } from './LayoutToggle';
// import SyntaxHighlighterOutput from './SyntaxHighlighter'; // <-- 移除這一行

// 引入 JsonPreview 和 YamlPreview
import JsonPreview from '../JsonPreview'; // 確保路徑正確
import YamlPreview from '../YamlPreview'; // 確保路徑正確

interface YamlFormatterProps {
  layout?: LayoutType;
}

export default function YamlFormatter({ layout = 'horizontal' }: YamlFormatterProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [outputType, setOutputType] = useState<'yaml' | 'json'>('yaml');

  const formatYaml = () => {
    try {
      setError('');
      // 使用 yaml.parseDocument() 解析，這會保留註解和其他元資料
      const doc = yaml.parseDocument(input);

      // 使用 doc.toString() 進行序列化，並應用格式化選項
      // 這會保留註解。
      const formatted = doc.toString({
        indent: 2,
        lineWidth: 80,
      });
      setOutput(formatted);
      setOutputType('yaml');
    } catch (err) {
      setError(`YAML 格式錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      setOutput('');
    }
  };

  const yamlToJsonConvert = () => {
    try {
      setError('');
      // yaml.parse() 會直接解析為 JavaScript 物件，註解會被捨棄
      const parsed = yaml.parse(input);
      const jsonString = JSON.stringify(parsed, null, 2);
      setOutput(jsonString);
      setOutputType('json');
    } catch (err) {
      setError(`YAML 轉 JSON 錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      setOutput('');
    }
  };

  const jsonToYamlConvert = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      // yaml.stringify() 將 JavaScript 物件轉換為 YAML
      const yamlString = yaml.stringify(parsed, {
        indent: 2,
        lineWidth: 80,
      });
      setOutput(yamlString);
      setOutputType('yaml');
    } catch (err) {
      setError(`JSON 轉 YAML 錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      setOutput('');
    }
  };

  const validateYaml = () => {
    try {
      // 使用 yaml.parse() 進行驗證，如果格式錯誤會拋出異常
      yaml.parse(input);
      setError('');
      alert('YAML 格式正確！');
    } catch (err) {
      setError(`YAML 格式錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setOutputType('yaml');
  };

  const downloadYaml = () => {
    if (!output) {
      alert('請先處理資料');
      return;
    }

    const extension = outputType === 'yaml' ? 'yaml' : 'json';
    const mimeType = outputType === 'yaml' ? 'text/yaml' : 'application/json';
    
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!output) {
      alert('請先處理資料');
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
        <h2 className="text-xl font-semibold text-gray-900">YAML 格式化工具</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={formatYaml}
              className="btn-sm-primary"
            >
              格式化
            </button>
            <button
              onClick={yamlToJsonConvert}
              className="btn-sm-secondary"
            >
              YAML → JSON
            </button>
            <button
              onClick={jsonToYamlConvert}
              className="btn-sm-secondary"
            >
              JSON → YAML
            </button>
            <button
              onClick={validateYaml}
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
              onClick={downloadYaml}
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
            輸入 YAML 或 JSON
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此輸入 YAML 或 JSON 資料..."
            className="form-input h-96 font-mono text-sm"
            style={{ resize: 'none' }}
          />
        </div>

        {/* 輸出區域 - 根據 outputType 選擇顯示 JsonPreview 或 YamlPreview */}
        <div>
          {/* 這裡不再需要 label，因為 Preview 元件內部可以包含 title */}
          {outputType === 'yaml' ? (
            <YamlPreview
              content={output}
              title={`處理結果 (YAML)`} // 這裡可以自訂 title
              placeholder="處理後的資料將顯示在此處..."
            />
          ) : ( // outputType === 'json'
            <JsonPreview
              content={output}
              title={`處理結果 (JSON)`} // 這裡可以自訂 title
              placeholder="處理後的資料將顯示在此處..."
            />
          )}
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
          <li>• 在輸入框中貼上或輸入 YAML 或 JSON 資料</li>
          <li>• 點擊「格式化」按鈕美化 YAML 格式，**並保留原有註解**</li>
          <li>• 點擊「YAML → JSON」按鈕將 YAML 轉換為 JSON</li>
          <li>• 點擊「JSON → YAML」按鈕將 JSON 轉換為 YAML</li>
          <li>• 點擊「驗證」按鈕檢查 YAML 格式是否正確</li>
          <li>• 可以複製結果到剪貼簿或下載相對應的檔案</li>
          <li>• 使用布局切換按鈕調整輸入輸出區域的排列方式</li>
          <li>• 使用 `yaml` 函式庫提供完整的 YAML 支援 (包括註解保留)</li>
          <li>• 輸出區域現在支援全螢幕、複製功能，並對大型內容進行性能優化</li>
        </ul>
      </div>
    </div>
  );
}