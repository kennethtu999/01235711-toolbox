'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SyntaxHighlighterOutputProps {
  content: string;
  language: string;
  placeholder?: string;
}

export default function SyntaxHighlighterOutput({
  content,
  language,
  placeholder = '處理後的資料將顯示在此處...'
}: SyntaxHighlighterOutputProps) {
  if (!content) {
    return (
      <div className="form-input h-96 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 italic">{placeholder}</p>
      </div>
    );
  }

  return (
    <div className="relative border border-gray-300 rounded-md overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          height: '384px', // h-96 equivalent
          margin: 0,
          fontSize: '14px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          lineHeight: '1.4',
          overflow: 'auto',
          backgroundColor: '#f9fafb', // bg-gray-50
          borderRadius: '6px'
        }}
        showLineNumbers={true}
        wrapLines={true}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          textAlign: 'right',
          userSelect: 'none',
          color: '#9ca3af'
        }}
      >
        {content}
      </SyntaxHighlighter>
      
      {/* 行數顯示 */}
      <div className="absolute top-2 right-2 opacity-75">
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
          {content.split('\n').length} 行
        </span>
      </div>
    </div>
  );
} 