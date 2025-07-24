// components/toolbox/YamlPreview.tsx (假設路徑)
'use client';

import { useState } from 'react';
import * as yaml from 'yaml'; // 引入 yaml 函式庫
import SyntaxHighlighterOutput from './toolbox/SyntaxHighlighter'; // 確保路徑正確

interface YamlPreviewProps {
  content: string;
  placeholder?: string;
  title?: string;
}

export default function YamlPreview({ content, placeholder = '無內容', title }: YamlPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if content is too large (>10KB characters) to disable syntax highlighting
  // 10240 characters is roughly 10KB (assuming 1 byte per char for simplicity)
  const isLargeContent = content.length > 10240;
  const hasContent = content.trim().length > 0;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => {
    if (!hasContent) {
      return (
        <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded">
          {placeholder}
        </div>
      );
    }

    if (isLargeContent) {
      // For large content, try to pretty-print YAML without syntax highlighting
      let formattedContent = content;
      try {
        const parsed = yaml.parse(content);
        // 使用 yaml.stringify 進行格式化，選項與 YamlFormatter 保持一致
        formattedContent = yaml.stringify(parsed, {
          indent: 2,
          lineWidth: 80,
          // sortKeys: false, // `yaml` library usually preserves order by default or uses `sortMapEntries`
        });
      } catch (e) {
        // If it's large and also invalid YAML, just show the raw content
        console.error("Error formatting large YAML content:", e);
        // 可以選擇在這裡顯示一個錯誤訊息，或者保留原始內容
        formattedContent = content; // Fallback to raw content if parsing fails
      }

      return (
        <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
            {formattedContent}
          </pre>
        </div>
      );
    }

    // For small content, use syntax highlighting
    return (
      <SyntaxHighlighterOutput
        content={content}
        language="yaml" // <-- 這裡從 "json" 改為 "yaml"
        placeholder={placeholder}
      />
    );
  };

  const containerClasses = isFullscreen
    ? 'fixed inset-0 bg-white z-50 p-6 overflow-auto'
    : 'relative';

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between mb-2">
        {title && (
          <h4 className="font-medium text-sm text-gray-700">{title}</h4>
        )}
        <div className="flex gap-2">
          {hasContent && (
            <>
              <button
                onClick={() => navigator.clipboard.writeText(content)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title="複製到剪貼簿"
              >
                📋 複製
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title={isFullscreen ? "退出全螢幕" : "全螢幕顯示"}
              >
                {isFullscreen ? '🗗 退出' : '🗖 全螢幕'}
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className={isFullscreen ? 'h-full' : ''}>
        {renderContent()}
      </div>
      
      {isFullscreen && (
        <div className="fixed top-4 right-4">
          <button
            onClick={toggleFullscreen}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ✕ 關閉
          </button>
        </div>
      )}
      
      {hasContent && isLargeContent && (
        <div className="mt-2 text-xs text-gray-500">
          💡 內容較大，已停用語法高亮以提升效能 ({content.length} 字元)
        </div>
      )}
    </div>
  );
}