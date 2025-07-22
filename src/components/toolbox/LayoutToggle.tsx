'use client';

import { useState, useEffect } from 'react';

export type LayoutType = 'horizontal' | 'vertical';

interface LayoutToggleProps {
  toolName: string;
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export default function LayoutToggle({ 
  toolName, 
  currentLayout, 
  onLayoutChange 
}: LayoutToggleProps) {
  const handleLayoutChange = (layout: LayoutType) => {
    onLayoutChange(layout);
    // 保存到 session storage
    sessionStorage.setItem(`toolbox-layout`, layout);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">布局:</span>
      <div className="flex bg-gray-100 rounded-md p-1">
        <button
          onClick={() => handleLayoutChange('horizontal')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            currentLayout === 'horizontal'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="左右排版"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </button>
        <button
          onClick={() => handleLayoutChange('vertical')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            currentLayout === 'vertical'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="上下排版"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// 自定義 hook 用於管理布局狀態
export function useLayoutPreference() {
  const [layout, setLayout] = useState<LayoutType>('horizontal');

  useEffect(() => {
    // 從 session storage 讀取布局偏好
    const savedLayout = sessionStorage.getItem(`toolbox-layout`);
    if (savedLayout === 'horizontal' || savedLayout === 'vertical') {
      setLayout(savedLayout);
    }
  }, []); // 只在組件掛載時執行一次

  return { layout, setLayout };
} 