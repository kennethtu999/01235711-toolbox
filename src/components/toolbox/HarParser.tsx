'use client';

import { useCallback, useEffect, useState } from 'react';
import JsonPreview from '../JsonPreview';
import LoadingSpinner from '../LoadingSpinner';
import { LayoutType } from './LayoutToggle';

interface HarEntry {
  request: {
    method: string;
    url: string;
    headers: Array<{ name: string; value: string }>;
    postData?: {
      mimeType: string;
      text: string;
    };
  };
  response: {
    status: number;
    statusText: string;
    headers: Array<{ name: string; value: string }>;
    content: {
      mimeType: string;
      text: string;
    };
  };
}

interface ParsedRequest {
  id: string;
  method: string;
  url: string;
  uri: string;
  status: number;
  statusText: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  requestJson?: any;
  responseJson?: any;
  colInfo?: string[];
}

interface HarParserProps {
  layout: LayoutType;
}

export default function HarParser({ layout }: HarParserProps) {
  const [harData, setHarData] = useState<ParsedRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ParsedRequest | null>(null);
  const [jsonPaths, setJsonPaths] = useState<string[]>(['']);
  const [summaryPaths, setSummaryPaths] = useState<string>('rq.resource\nrq.trackingIxd\nrs.code');
  const [curlOutput, setCurlOutput] = useState<string>('');
  const [postmanOutput, setPostmanOutput] = useState<string>('');
  const [showCurl, setShowCurl] = useState(false);
  const [showPostman, setShowPostman] = useState(false);

  const parseHarFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      const harJson = JSON.parse(text);
      
      if (!harJson.log || !harJson.log.entries) {
        throw new Error('無效的 HAR 檔案格式');
      }

      const requests: ParsedRequest[] = harJson.log.entries
        .filter((entry: HarEntry) => {
          // 過濾出 JSON content-type 的請求
          const responseContentType = entry.response.content.mimeType;
          const requestContentType = entry.request.postData?.mimeType || '';
          return responseContentType.includes('json') || requestContentType.includes('json');
        })
        .map((entry: HarEntry, index: number) => {
          const url = new URL(entry.request.url);
          const requestHeaders = entry.request.headers.reduce((acc, header) => {
            acc[header.name] = header.value;
            return acc;
          }, {} as Record<string, string>);
          
          const responseHeaders = entry.response.headers.reduce((acc, header) => {
            acc[header.name] = header.value;
            return acc;
          }, {} as Record<string, string>);

          let requestJson = null;
          let responseJson = null;
          
          try {
            if (entry.request.postData?.text) {
              requestJson = JSON.parse(entry.request.postData.text);
            }
          } catch (e) {
            // 忽略解析錯誤
          }
          
          try {
            if (entry.response.content.text) {
              responseJson = JSON.parse(entry.response.content.text);
            }
          } catch (e) {
            // 忽略解析錯誤
          }

          return {
            id: `req-${index}`,
            method: entry.request.method,
            url: entry.request.url,
            uri: `${entry.request.method} ${url.pathname}${url.search}`,
            status: entry.response.status,
            statusText: entry.response.statusText,
            requestHeaders,
            responseHeaders,
            requestBody: entry.request.postData?.text,
            responseBody: entry.response.content.text,
            requestJson,
            responseJson,
            colInfo: []
          };
        });

      setHarData(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析 HAR 檔案時發生錯誤');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await parseHarFile(file);
    }
  }, [parseHarFile]);

  const extractJsonPath = useCallback((obj: any, path: string): string => {
    if (!obj || !path.trim()) return '';
    
    try {
      const keys = path.split('.');
      let current = obj;
      
      for (const key of keys) {
        if (current === null || current === undefined) {
          return '';
        }
        if (key.includes('[') && key.includes(']')) {
          const [arrayKey, indexStr] = key.split('[');
          const index = parseInt(indexStr.replace(']', ''));
          current = current[arrayKey]?.[index];
        } else {
          current = current[key];
        }
      }
      
      return typeof current === 'object' ? JSON.stringify(current) : String(current);
    } catch (e) {
      return '';
    }
  }, []);

  const updateColInfo = useCallback((request: ParsedRequest, paths: string[]) => {
    if (!request.responseJson) return;
    
    const colInfo = paths
      .filter(path => path.trim())
      .map(path => {
        const value = extractJsonPath(request.responseJson, path);
        return value ? `${path}: ${value}` : '';
      })
      .filter(Boolean);
    
    request.colInfo = colInfo;
  }, [extractJsonPath]);

  const updateRequestSummary = useCallback((request: ParsedRequest, reqPaths: string[], resPaths: string[]) => {
    const summaryParts: string[] = [];
    
    // 處理請求摘要
    if (request.requestJson && reqPaths.length > 0) {
      const reqSummary = reqPaths
        .filter(path => path.trim())
        .map(path => {
          const value = extractJsonPath(request.requestJson, path);
          return value ? `rq.${path}: ${value}` : '';
        })
        .filter(Boolean);
      summaryParts.push(...reqSummary);
    }
    
    // 處理回應摘要
    if (request.responseJson && resPaths.length > 0) {
      const resSummary = resPaths
        .filter(path => path.trim())
        .map(path => {
          const value = extractJsonPath(request.responseJson, path);
          return value ? `rs.${path}: ${value}` : '';
        })
        .filter(Boolean);
      summaryParts.push(...resSummary);
    }
    
    request.colInfo = summaryParts;
  }, [extractJsonPath]);

  const parseSummaryPaths = useCallback((pathsText: string) => {
    const lines = pathsText.split('\n').filter(line => line.trim());
    const reqPaths: string[] = [];
    const resPaths: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('rq.')) {
        reqPaths.push(trimmed.substring(3));
      } else if (trimmed.startsWith('rs.')) {
        resPaths.push(trimmed.substring(3));
      }
    });
    
    return { reqPaths, resPaths };
  }, []);

  const updateAllRequestsSummary = useCallback((pathsText: string) => {
    const { reqPaths, resPaths } = parseSummaryPaths(pathsText);
    setHarData(prevData => 
      prevData.map(request => {
        const updatedRequest = { ...request };
        updateRequestSummary(updatedRequest, reqPaths, resPaths);
        return updatedRequest;
      })
    );
  }, [updateRequestSummary, parseSummaryPaths]);

  const generateCurl = useCallback((request: ParsedRequest) => {
    const curlParts = ['curl'];
    
    // 添加 method
    if (request.method !== 'GET') {
      curlParts.push(`-X ${request.method}`);
    }
    
    // 添加 headers
    Object.entries(request.requestHeaders).forEach(([key, value]) => {
      if (key.toLowerCase() === 'host') return; // 跳過 host header
      curlParts.push(`-H "${key}: ${value}"`);
    });
    
    // 添加 body
    if (request.requestBody) {
      curlParts.push(`-d '${request.requestBody}'`);
    }
    
    // 添加 URL
    curlParts.push(`"${request.url}"`);
    
    return curlParts.join(' \\\n  ');
  }, []);

  const generatePostmanCollection = useCallback(() => {
    const collection = {
      info: {
        name: "HAR 解析結果",
        description: "從 HAR 檔案解析的請求集合",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: harData.map(request => {
        try {
          const url = new URL(request.url);
          return {
            name: request.uri,
            request: {
              method: request.method,
              header: Object.entries(request.requestHeaders).map(([key, value]) => ({
                key,
                value,
                type: "text"
              })),
              body: request.requestBody ? {
                mode: "raw",
                raw: request.requestBody,
                options: {
                  raw: {
                    language: "json"
                  }
                }
              } : undefined,
              url: {
                raw: request.url,
                host: [url.hostname],
                path: url.pathname.split('/').filter(Boolean),
                query: url.search ? url.search.substring(1).split('&').map(param => {
                  const [key, value] = param.split('=');
                  return { key, value: value || '' };
                }) : []
              }
            },
            response: []
          };
        } catch (e) {
          // 如果 URL 解析失敗，使用簡化版本
          return {
            name: request.uri,
            request: {
              method: request.method,
              header: Object.entries(request.requestHeaders).map(([key, value]) => ({
                key,
                value,
                type: "text"
              })),
              body: request.requestBody ? {
                mode: "raw",
                raw: request.requestBody,
                options: {
                  raw: {
                    language: "json"
                  }
                }
              } : undefined,
              url: {
                raw: request.url
              }
            },
            response: []
          };
        }
      })
    };
    
    return JSON.stringify(collection, null, 2);
  }, [harData]);

  const handleRequestClick = useCallback((request: ParsedRequest) => {
    setSelectedRequest(request);
    setShowCurl(false);
    setShowPostman(false);
  }, []);

  const handleGenerateCurl = useCallback(() => {
    if (selectedRequest) {
      const curl = generateCurl(selectedRequest);
      setCurlOutput(curl);
      setShowCurl(true);
    }
  }, [selectedRequest, generateCurl]);

  const handleGeneratePostman = useCallback(() => {
    const postman = generatePostmanCollection();
    setPostmanOutput(postman);
    setShowPostman(true);
  }, [generatePostmanCollection]);

  const handleJsonPathChange = useCallback((index: number, value: string) => {
    const newPaths = [...jsonPaths];
    newPaths[index] = value;
    setJsonPaths(newPaths);
    
    if (selectedRequest) {
      updateColInfo(selectedRequest, newPaths);
    }
  }, [jsonPaths, selectedRequest, updateColInfo]);

  const addJsonPath = useCallback(() => {
    setJsonPaths([...jsonPaths, '']);
  }, [jsonPaths]);

  const removeJsonPath = useCallback((index: number) => {
    const newPaths = jsonPaths.filter((_, i) => i !== index);
    setJsonPaths(newPaths);
    
    if (selectedRequest) {
      updateColInfo(selectedRequest, newPaths);
    }
  }, [jsonPaths, selectedRequest, updateColInfo]);

  const handleSummaryPathsChange = useCallback((value: string) => {
    setSummaryPaths(value);
    updateAllRequestsSummary(value);
  }, [updateAllRequestsSummary]);

  // 當 harData 更新時自動應用摘要過濾
  useEffect(() => {
    if (harData.length > 0) {
      updateAllRequestsSummary(summaryPaths);
    }
  }, [harData, summaryPaths, updateAllRequestsSummary]);

  const renderLayout = () => {
    if (layout === 'horizontal') {
      return (
        <div className="flex gap-6">
          <div className="w-1/2">
            {renderLeftPanel()}
          </div>
          <div className="w-1/2">
            {renderRightPanel()}
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          {renderLeftPanel()}
          {renderRightPanel()}
        </div>
      );
    }
  };

  const renderLeftPanel = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          上傳 HAR 檔案
        </label>
        <input
          type="file"
          accept=".har"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
      </div>

      {loading && (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {harData.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">摘要過濾設定</h3>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              輸入要提取的欄位路徑 <span className="text-xs text-gray-500 space-y-1"> (rq.欄位名 或 rs.欄位名 每行一個)</span>
            </label>
            <textarea
              value={summaryPaths}
              onChange={(e) => handleSummaryPathsChange(e.target.value)}
              placeholder="rq.resource&#10;rq.trackingIxd&#10;rs.code&#10;rs.sys"
              className="form-input min-h-[80px] font-mono text-sm"
              rows={3}
            />
          </div>
        </div>
      )}

      {harData.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">JSON 請求列表 ({harData.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {harData.map((request) => (
              <div
                key={request.id}
                onClick={() => handleRequestClick(request)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRequest?.id === request.id
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      request.method === 'GET' ? 'bg-green-100 text-green-800' :
                      request.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      request.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.method}
                    </span>
                    <span className="text-sm font-medium">{request.uri}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    request.status >= 200 && request.status < 300 ? 'bg-green-100 text-green-800' :
                    request.status >= 400 ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
                {request.colInfo && request.colInfo.length > 0 && (
                  <div className="mt-2 text-xs space-y-1">
                    {request.colInfo.map((info, index) => (
                      <div key={index} className={`${
                        info.startsWith('rq.') 
                          ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded' 
                          : info.startsWith('rs.') 
                          ? 'text-green-600 bg-green-50 px-2 py-1 rounded'
                          : 'text-gray-600'
                      }`}>
                        {info}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRightPanel = () => (
    <div className="space-y-4">
      
      {harData.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleGeneratePostman}
            className="btn-sm-primary"
          >
            📄 匯出 Postman Collection
          </button>
          {selectedRequest && (
            <button
              onClick={handleGenerateCurl}
              className="btn-sm-secondary"
            >
              🔧 產生 curl 指令
            </button>
          )}
        </div>
      )}

      {selectedRequest && (
        <div>
          <div className="space-y-4">
            <JsonPreview
              title="請求內容"
              content={selectedRequest.requestJson 
                ? JSON.stringify(selectedRequest.requestJson, null, 2)
                : selectedRequest.requestBody || ''
              }
              placeholder="無請求內容"
            />
            <JsonPreview
              title="回應內容"
              content={selectedRequest.responseJson 
                ? JSON.stringify(selectedRequest.responseJson, null, 2)
                : selectedRequest.responseBody || ''
              }
              placeholder="無回應內容"
            />
            <div>
              <h4 className="font-medium text-sm mb-2">HEADER</h4>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                {Object.entries(selectedRequest.responseHeaders).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      )}

      {showCurl && curlOutput && (
        <div>
          <h3 className="text-lg font-medium mb-2">curl 指令</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">{curlOutput}</pre>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(curlOutput)}
            className="btn-sm-secondary mt-2"
          >
            📋 複製到剪貼簿
          </button>
        </div>
      )}

      {showPostman && postmanOutput && (
        <div>
          <h3 className="text-lg font-medium mb-2">Postman Collection</h3>
          <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto max-h-96">
            <pre className="text-sm">{postmanOutput}</pre>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => navigator.clipboard.writeText(postmanOutput)}
              className="btn-sm-secondary"
            >
              📋 複製到剪貼簿
            </button>
            <button
              onClick={() => {
                const blob = new Blob([postmanOutput], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'har-collection.postman_collection.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="btn-sm-primary"
            >
              💾 下載檔案
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderLayout()}
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-blue-800 font-medium mb-2">🔧 HAR 解析器</h3>
        <p className="text-blue-700 text-sm mb-2">
          上傳 HAR 檔案來解析 HTTP 請求，自動過濾 JSON 格式的請求/回應。
          支援 JSON Path 提取、curl 指令產生和 Postman Collection 匯出。
        </p>
        <p className="text-blue-700 text-sm">
          💡 <strong>摘要過濾功能:</strong> 設定請求和回應的 JSON Path 來提取關鍵資訊，在列表中快速查看摘要內容。
          例如設定 <code className="bg-blue-100 px-1 rounded">resource</code> 和 <code className="bg-blue-100 px-1 rounded">code</code> 即可在列表中看到每個請求的資源路徑和回應狀態。
        </p>
      </div>
      
      
    </div>
  );
} 