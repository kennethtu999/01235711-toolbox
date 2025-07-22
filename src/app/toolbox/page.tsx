'use client';

import { lazy, useState } from 'react';
const JsonFormatter = lazy(() => import('@/components/toolbox/JsonFormatter'));
const YamlFormatter = lazy(() => import('@/components/toolbox/YamlFormatter'));
const XmlFormatter = lazy(() => import('@/components/toolbox/XmlFormatter'));

const HarParser = lazy(() => import('@/components/toolbox/HarParser'));
import LayoutToggle, { useLayoutPreference, LayoutType } from '@/components/toolbox/LayoutToggle';

type ToolType = 'json' | 'yaml' | 'xml' | 'har';

export default function ToolboxPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('json');
  const { layout, setLayout } = useLayoutPreference();
  
  // 為每個工具維護重置計數器，用於強制重新渲染來實現清除功能
  const [toolResetKeys, setToolResetKeys] = useState<{[key in ToolType]: number}>({
    json: 0,
    yaml: 0,
    xml: 0,
    har: 0
  });

  const tools = [
    { id: 'json', label: 'JSON 格式化', icon: '{}' },
    { id: 'yaml', label: 'YAML 格式化', icon: '📝' },
    { id: 'xml', label: 'XML 格式化', icon: '📋' },
    { id: 'har', label: 'HAR 解析', icon: '🔧' }
  ];

  const handleClearTool = () => {
    setToolResetKeys(prev => ({
      ...prev,
      [activeTool]: prev[activeTool] + 1
    }));
  };

  return (
    <div className="">
      <div className="">
        
        {/* 工具切換選單 */}
        <div className="mb-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-between items-center">
              {/* 左側：工具切換 tabs */}
              <div className="flex space-x-8">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as ToolType)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTool === tool.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tool.icon}</span>
                    {tool.label}
                  </button>
                ))}
              </div>
              
              {/* 右側：清除按鈕 + 布局切換 */}
              <div className="flex items-center space-x-4 py-3">
                <button
                  onClick={handleClearTool}
                  className="btn-sm-danger"
                  title="清除當前工具的所有內容"
                >
                  清除
                </button>
                <LayoutToggle 
                  toolName={activeTool}
                  currentLayout={layout}
                  onLayoutChange={setLayout}
                />
              </div>
            </nav>
          </div>
        </div>

        {/* 工具內容 - 保持所有工具都渲染，只切換顯示狀態 */}
        <div className="card">
          <div className="p-6">
            <div className={activeTool === 'json' ? 'block' : 'hidden'}>
              <JsonFormatter 
                key={toolResetKeys.json}
                layout={layout} 
              />
            </div>
            <div className={activeTool === 'yaml' ? 'block' : 'hidden'}>
              <YamlFormatter 
                key={toolResetKeys.yaml}
                layout={layout}
              />
            </div>
            <div className={activeTool === 'xml' ? 'block' : 'hidden'}>
              <XmlFormatter 
                key={toolResetKeys.xml}
                layout={layout}
              />
            </div>
            <div className={activeTool === 'har' ? 'block' : 'hidden'}>
              <HarParser 
                key={toolResetKeys.har}
                layout={layout}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 