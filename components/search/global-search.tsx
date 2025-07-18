"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, Package, Building2, Users, FileText, Calendar, TruckIcon, Activity } from "lucide-react"

interface SearchResult {
  id: string
  title: string
  description: string
  category: "inventory" | "company" | "user" | "schedule" | "inout" | "agv"
  url: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

// 더미 검색 데이터 (컴포넌트 밖으로 이동)
const searchData: SearchResult[] = [
  {
    id: "1",
    title: "노트북 - ThinkPad X1",
    description: "재고: 245개, 위치: A구역-01",
    category: "inventory",
    url: "/inventory",
  },
  {
    id: "2",
    title: "삼성전자",
    description: "거래처 코드: COMP001, 대표자: 김삼성",
    category: "company",
    url: "/company-list",
  },
  {
    id: "3",
    title: "김창고 (manager1)",
    description: "매니저, 마지막 접속: 2024-01-15 13:45",
    category: "user",
    url: "/user-management",
  },
  {
    id: "4",
    title: "창고 정리 작업",
    description: "2024-01-16 10:00, A구역",
    category: "schedule",
    url: "/schedule",
  },
  {
    id: "5",
    title: "무선 마우스 입고",
    description: "수량: 100개, 완료일: 2024-01-15",
    category: "inout",
    url: "/inout-history",
  },
  {
    id: "6",
    title: "AGV-001",
    description: "상태: 활성, 배터리: 85%, 현재 작업: 대기중",
    category: "agv",
    url: "/simulation",
  },
]

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (searchTerm.length > 0) {
      setIsLoading(true)
      // 검색 시뮬레이션
      setTimeout(() => {
        const filtered = searchData.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setResults(filtered)
        setIsLoading(false)
      }, 300)
    } else {
      setResults([])
    }
  }, [searchTerm])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return <Package className="w-4 h-4" />
      case "company":
        return <Building2 className="w-4 h-4" />
      case "user":
        return <Users className="w-4 h-4" />
      case "schedule":
        return <Calendar className="w-4 h-4" />
      case "inout":
        return <TruckIcon className="w-4 h-4" />
      case "agv":
        return <Activity className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "inventory":
        return "재고"
      case "company":
        return "거래처"
      case "user":
        return "사용자"
      case "schedule":
        return "일정"
      case "inout":
        return "입출고"
      case "agv":
        return "AGV"
      default:
        return "기타"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "inventory":
        return "bg-blue-100 text-blue-800"
      case "company":
        return "bg-green-100 text-green-800"
      case "user":
        return "bg-purple-100 text-purple-800"
      case "schedule":
        return "bg-orange-100 text-orange-800"
      case "inout":
        return "bg-red-100 text-red-800"
      case "agv":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleResultClick = (result: SearchResult) => {
    // 실제 구현에서는 라우팅 처리
    console.log("Navigate to:", result.url)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden">
        {/* 검색 헤더 */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="전역 검색... (재고, 거래처, 사용자, 일정 등)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 text-lg"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">검색 중...</p>
            </div>
          ) : searchTerm.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>검색어를 입력하세요</p>
              <p className="text-sm mt-2">재고, 거래처, 사용자, 일정, 입출고 내역 등을 검색할 수 있습니다</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>검색 결과가 없습니다</p>
              <p className="text-sm mt-2">다른 검색어를 시도해보세요</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getCategoryIcon(result.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                        <Badge className={getCategoryColor(result.category)}>{getCategoryName(result.category)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{result.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 검색 팁 */}
        {searchTerm.length === 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>팁:</strong> 다음과 같은 항목들을 검색할 수 있습니다:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">재고 품목</Badge>
                <Badge variant="outline">거래처</Badge>
                <Badge variant="outline">사용자</Badge>
                <Badge variant="outline">일정</Badge>
                <Badge variant="outline">입출고 내역</Badge>
                <Badge variant="outline">AGV</Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
