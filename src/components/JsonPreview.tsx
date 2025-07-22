'use client';

import { useState } from 'react';
import SyntaxHighlighterOutput from './toolbox/SyntaxHighlighter';

interface JsonPreviewProps {
  content: string;
  placeholder?: string;
  title?: string;
}

export default function JsonPreview({ content, placeholder = '無內容', title }: JsonPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if content is too large (>100 characters) to disable syntax highlighting
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
      // For large content, just show pretty-printed JSON without syntax highlighting
      return (
        <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
            {content}
          </pre>
        </div>
      );
    }

    // For small content, use syntax highlighting
    return (
      <SyntaxHighlighterOutput
        content={content}
        language="json"
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