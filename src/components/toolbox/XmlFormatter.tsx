'use client';

import { useState } from 'react';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { LayoutType } from './LayoutToggle';
import SyntaxHighlighterOutput from './SyntaxHighlighter';

interface XmlFormatterProps {
  layout?: LayoutType;
}

export default function XmlFormatter({ layout = 'horizontal' }: XmlFormatterProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [outputType, setOutputType] = useState<'xml' | 'json'>('xml');

  const formatXml = () => {
    try {
      setError('');
      
      // 解析 XML
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text"
      });
      
      const parsed = parser.parse(input);
      
      // 格式化 XML
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text",
        format: true,
        indentBy: "  "
      });
      
      const formatted = builder.build(parsed);
      setOutput(formatted);
      setOutputType('xml');
    } catch (err) {
      setError(`XML 格式錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      setOutput('');
    }
  };

  const xmlToJsonConvert = () => {
    try {
      setError('');
      
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text"
      });
      
      const parsed = parser.parse(input);
      const jsonString = JSON.stringify(parsed, null, 2);
      setOutput(jsonString);
      setOutputType('json');
    } catch (err) {
      setError(`XML 轉 JSON 錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      setOutput('');
    }
  };

  const jsonToXmlConvert = () => {
    try {
      setError('');
      
      const parsed = JSON.parse(input);
      
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text",
        format: true,
        indentBy: "  "
      });
      
      const xmlString = builder.build(parsed);
      setOutput(xmlString);
      setOutputType('xml');
    } catch (err) {
      setError(`JSON 轉 XML 錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      setOutput('');
    }
  };

  const minifyXml = () => {
    try {
      setError('');
      
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text"
      });
      
      const parsed = parser.parse(input);
      
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text",
        format: false
      });
      
      const minified = builder.build(parsed);
      setOutput(minified);
      setOutputType('xml');
    } catch (err) {
      setError(`XML 壓縮錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
      setOutput('');
    }
  };

  const validateXml = () => {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text"
      });
      
      parser.parse(input);
      setError('');
      alert('XML 格式正確！');
    } catch (err) {
      setError(`XML 格式錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setOutputType('xml');
  };

  const downloadXml = () => {
    if (!output) {
      alert('請先處理資料');
      return;
    }

    const extension = outputType === 'xml' ? 'xml' : 'json';
    const mimeType = outputType === 'xml' ? 'text/xml' : 'application/json';

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
        <h2 className="text-xl font-semibold text-gray-900">XML 格式化工具</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={formatXml}
              className="btn-sm-primary"
            >
              格式化
            </button>
            <button
              onClick={minifyXml}
              className="btn-sm-secondary"
            >
              壓縮 XML
            </button>
            <button
              onClick={xmlToJsonConvert}
              className="btn-sm-secondary"
            >
              XML → JSON
            </button>
            <button
              onClick={jsonToXmlConvert}
              className="btn-sm-secondary"
            >
              JSON → XML
            </button>
            <button
              onClick={validateXml}
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
              onClick={downloadXml}
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
            輸入 XML 或 JSON
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此輸入 XML 或 JSON 資料..."
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
          <li>• 在輸入框中貼上或輸入 XML 或 JSON 資料</li>
          <li>• 點擊「格式化 XML」按鈕美化 XML 格式</li>
          <li>• 點擊「壓縮 XML」按鈕移除所有空格和換行</li>
          <li>• 點擊「XML → JSON」按鈕將 XML 轉換為 JSON</li>
          <li>• 點擊「JSON → XML」按鈕將 JSON 轉換為 XML</li>
          <li>• 點擊「驗證」按鈕檢查 XML 格式是否正確</li>
          <li>• 可以複製結果到剪貼簿或下載相對應的檔案</li>
          <li>• 使用布局切換按鈕調整輸入輸出區域的排列方式</li>
          <li>• 使用 fast-xml-parser 庫提供完整的 XML 支援</li>
        </ul>
      </div>
    </div>
  );
} 