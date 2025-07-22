'use client';

import { useState } from 'react';
import yaml from 'js-yaml';
import { LayoutType } from './LayoutToggle';
import SyntaxHighlighterOutput from './SyntaxHighlighter';

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
      // 先解析 YAML 為 JavaScript 物件
      const parsed = yaml.load(input);
      // 再轉換回格式化的 YAML
      const formatted = yaml.dump(parsed, {
        indent: 2,
        lineWidth: 80,
        sortKeys: false
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
      const parsed = yaml.load(input);
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
      const yamlString = yaml.dump(parsed, {
        indent: 2,
        lineWidth: 80,
        sortKeys: false
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
      yaml.load(input);
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

        {/* 輸出區域 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            處理結果 ({outputType.toUpperCase()})
          </label>
          <SyntaxHighlighterOutput
            content={output}
            language={outputType}
            placeholder="處理後的資料將顯示在此處..."
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
          <li>• 在輸入框中貼上或輸入 YAML 或 JSON 資料</li>
          <li>• 點擊「格式化 YAML」按鈕美化 YAML 格式</li>
          <li>• 點擊「YAML → JSON」按鈕將 YAML 轉換為 JSON</li>
          <li>• 點擊「JSON → YAML」按鈕將 JSON 轉換為 YAML</li>
          <li>• 點擊「驗證」按鈕檢查 YAML 格式是否正確</li>
          <li>• 可以複製結果到剪貼簿或下載相對應的檔案</li>
          <li>• 使用布局切換按鈕調整輸入輸出區域的排列方式</li>
          <li>• 使用 js-yaml 庫提供完整的 YAML 支援</li>
        </ul>
      </div>
    </div>
  );
} 