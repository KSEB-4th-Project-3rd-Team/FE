"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import http from "@/lib/http";

interface ApiResult {
  endpoint: string;
  method: string;
  status: number;
  data: any;
  error?: string;
  timestamp: string;
}

export default function ApiConsolePage() {
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const addResult = (result: ApiResult) => {
    setResults(prev => [result, ...prev.slice(0, 19)]); // Keep last 20 results
  };

  const callApi = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) => {
    setLoading(endpoint);
    const timestamp = new Date().toLocaleString('ko-KR');
    
    try {
      let response;
      
      switch (method) {
        case 'GET':
          response = await http.get(endpoint);
          break;
        case 'POST':
          response = await http.post(endpoint, data);
          break;
        case 'PUT':
          response = await http.put(endpoint, data);
          break;
        case 'DELETE':
          response = await http.delete(endpoint);
          break;
      }
      
      addResult({
        endpoint,
        method,
        status: response.status,
        data: response.data,
        timestamp
      });
    } catch (error: any) {
      addResult({
        endpoint,
        method,
        status: error?.response?.status || 0,
        data: null,
        error: error?.response?.data?.message || error.message,
        timestamp
      });
    } finally {
      setLoading(null);
    }
  };

  const apiEndpoints = [
    // Health Check
    { name: "Health Check", endpoint: "/actuator/health", method: "GET" as const },
    
    // Dashboard
    { name: "Dashboard Summary", endpoint: "/api/dashboard/summary", method: "GET" as const },
    { name: "Dashboard All", endpoint: "/api/dashboard/all", method: "GET" as const },
    
    // Inventory
    { name: "Inventory List", endpoint: "/api/inventory", method: "GET" as const },
    { name: "Inventory History", endpoint: "/api/inventory/history", method: "GET" as const },
    
    // Items
    { name: "Items List", endpoint: "/api/items", method: "GET" as const },
    
    // Companies
    { name: "Companies List", endpoint: "/api/companies", method: "GET" as const },
    
    // Users
    { name: "Users List", endpoint: "/api/users", method: "GET" as const },
    
    // Orders
    { name: "InOut Orders", endpoint: "/api/inout/orders", method: "GET" as const },
    
    // Schedules
    { name: "Schedules List", endpoint: "/api/schedules", method: "GET" as const },
    
    // Racks
    { name: "Racks List", endpoint: "/api/racks", method: "GET" as const },
    { name: "Racks Map", endpoint: "/api/racks/map", method: "GET" as const },
    { name: "Racks Inventory Summary", endpoint: "/api/racks/inventory/summary", method: "GET" as const },
    
    // AMR
    { name: "AMR Status", endpoint: "/api/amrs", method: "GET" as const },
    
    // Notifications
    { name: "Notifications", endpoint: "/api/notifications", method: "GET" as const },
  ];

  const clearResults = () => setResults([]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Console</h1>
        <p className="text-muted-foreground">
          프로덕션 백엔드 API 엔드포인트 테스트 콘솔
        </p>
        <p className="text-sm text-blue-600 mt-2">
          Base URL: {process.env.NEXT_PUBLIC_API_BASE || "https://smart-wms-be.p-e.kr"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>
              클릭하여 각 엔드포인트를 테스트할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {apiEndpoints.map((api, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{api.name}</div>
                      <div className="text-sm text-muted-foreground">{api.endpoint}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={api.method === 'GET' ? 'default' : 'secondary'}>
                        {api.method}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => callApi(api.endpoint, api.method)}
                        disabled={loading === api.endpoint}
                      >
                        {loading === api.endpoint ? "..." : "Test"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  API 호출 결과 (최대 20개)
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {results.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    아직 API 호출 결과가 없습니다.
                  </div>
                ) : (
                  results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={result.method === 'GET' ? 'default' : 'secondary'}>
                            {result.method}
                          </Badge>
                          <span className="font-mono text-sm">{result.endpoint}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={result.status >= 200 && result.status < 300 ? 'default' : 'destructive'}
                          >
                            {result.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.timestamp}
                          </span>
                        </div>
                      </div>
                      
                      {result.error && (
                        <div className="mb-2">
                          <Badge variant="destructive">Error</Badge>
                          <p className="text-sm text-red-600 mt-1">{result.error}</p>
                        </div>
                      )}
                      
                      <Separator className="my-2" />
                      
                      <Textarea
                        value={JSON.stringify(result.data, null, 2)}
                        readOnly
                        className="font-mono text-xs"
                        rows={6}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}