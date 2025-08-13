"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, MapPin, BarChart3, Zap, ZapOff } from "lucide-react"
import { InventoryItem } from "@/components/utils"
import { useQueryData } from "@/contexts/query-data-context"
import { useRacks, useRackInventory } from "@/lib/queries"
import type { Rack, RackInventoryItem } from "@/lib/api"

interface RackPosition {
  section: string // A~T
  position: number // 1~12
  x: number // 퍼센트 (%)
  y: number // 퍼센트 (%)
  width: number // 퍼센트 (%)
  height: number // 퍼센트 (%)
}

// warehouse.png 구조에 맞게: 10개의 세로 긴 랙 컬럼
const RACK_SECTIONS = [
  ['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J'],
  ['K', 'L'], ['M', 'N'], ['O', 'P'], ['Q', 'R'], ['S', 'T']
]

// warehouse.png처럼 세로로 긴 랙 구조지만 내부적으로는 240개 랙 유지
const generateRackPositions = (): RackPosition[] => {
  const positions: RackPosition[] = []
  
  // warehouse.png처럼 통로가 있는 세로로 긴 랙 구조, 개별 랙 유지
  RACK_SECTIONS.forEach((sectionPair, colIndex) => {
    sectionPair.forEach((section, sectionIndex) => {
      // 각 섹션에 12개 위치 (1~12)를 개별 랙으로 생성
      for (let position = 1; position <= 12; position++) {
        const rackWidth = 2.8 // 랙 너비를 줄임
        const rackHeight = 5 // 각 개별 랙의 높이
        
        // 새로운 좌표계: AB와 CD 그룹 사이 간격 추가
        const totalColumns = 10 // A-B ~ S-T (10개 컬럼)
        const screenWidth = 88 // 사용 가능한 화면 너비 (%)
        const columnWidth = screenWidth / totalColumns // 각 컬럼이 차지하는 너비
        
        // X 좌표: 각 컬럼 내에서 A/B 배치, 컬럼 간 간격 추가
        const columnStartX = 2 + (colIndex * (columnWidth + 1)) // 컬럼 간 1% 추가 간격
        const x = columnStartX + (sectionIndex * (rackWidth + 0.8)) // A/B 사이 0.8% 간격
        
        // Y 좌표: 행 간격을 대폭 늘림
        const totalRows = 12
        const screenHeight = 78 // 사용 가능한 화면 높이 (%)
        const rowHeight = screenHeight / totalRows // 각 행이 차지하는 높이
        const y = 12 + ((position - 1) * rowHeight) // 12%부터 시작
        
        positions.push({
          section,
          position,
          x,
          y,
          width: rackWidth,
          height: rackHeight,
        })
      }
    })
  })
  
  return positions
}

const RACK_POSITIONS = generateRackPositions()

interface WarehouseMapProps {
  inventoryData?: InventoryItem[]
}

export default function WarehouseMap({ inventoryData }: WarehouseMapProps) {
  const { inventory } = useQueryData()
  const { data: racks = [], isLoading: racksLoading } = useRacks()
  const [selectedRack, setSelectedRack] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  // 선택된 랙의 재고 정보 가져오기 (백엔드 API 사용)
  const { data: rackInventoryItems = [], isLoading: rackInventoryLoading } = useRackInventory(selectedRack)
  
  // 재고 데이터 사용 (props가 있으면 props 사용, 없으면 context에서 가져오기)
  const items = inventoryData || inventory?.data || []

  // 랙 코드로 랙 정보 찾기 (예: "A001")
  const getRackInfo = (section: string, position: number): Rack | undefined => {
    const rackCode = `${section}${position.toString().padStart(3, '0')}` // A001 형태
    return racks.find(rack => rack.rackCode === rackCode)
  }

  // 랙에 재고가 있는지 확인 (실제 백엔드 Rack 데이터에서 inventories 배열 확인)
  const hasRackInventory = (section: string, position: number): boolean => {
    const rackInfo = getRackInfo(section, position)
    return rackInfo ? (rackInfo.inventories?.length ?? 0) > 0 : false
  }

  // 실제 활성 랙과 비활성 랙 계산
  const activeRacks = racks.filter(rack => (rack.inventories?.length ?? 0) > 0)
  const inactiveRacks = racks.filter(rack => (rack.inventories?.length ?? 0) === 0)
  
  // 전체 재고 계산
  const totalInventoryItems = racks.reduce((total, rack) => 
    total + (rack.inventories?.length ?? 0), 0
  )
  const totalQuantity = racks.reduce((total, rack) => 
    total + (rack.inventories?.reduce((sum, inv) => sum + inv.quantity, 0) ?? 0), 0
  )

  const handleRackClick = (section: string, position: number) => {
    const rackCode = `${section}${position.toString().padStart(3, '0')}`
    setSelectedRack(rackCode)
    setShowModal(true)
  }

  // 선택된 랙 정보
  const selectedRackInfo = selectedRack ? racks.find(r => r.rackCode === selectedRack) : null
  // 백엔드에서 가져온 실제 랙 재고 데이터 사용
  const selectedRackInventory = rackInventoryItems
  const selectedRackTotalQuantity = selectedRackInventory.reduce((sum, item) => sum + item.quantity, 0)
  const selectedRackTotalItems = selectedRackInventory.length

  if (racksLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">랙 정보를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* 통계 정보 */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {activeRacks.length}
              </div>
              <div className="text-sm text-muted-foreground">활성 랙</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {inactiveRacks.length}
              </div>
              <div className="text-sm text-muted-foreground">비활성 랙</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {totalInventoryItems}
              </div>
              <div className="text-sm text-muted-foreground">총 재고품목</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {totalQuantity}
              </div>
              <div className="text-sm text-muted-foreground">총 수량</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 창고 맵 */}
      <Card>
        <CardContent className="p-6">
          <div className="relative w-full h-[800px] bg-white rounded-lg border-2 border-gray-300 shadow-inner">
            {/* 창고 바닥 */}
            <div className="absolute inset-4 bg-gray-50 rounded">
              
              {/* 섹션 헤더 - A, B 개별적으로 표시 */}
              {RACK_SECTIONS.map((sectionPair, colIndex) => {
                const columnWidth = 88 / 10 // 동일한 계산
                const columnStartX = 2 + (colIndex * (columnWidth + 1)) // 랙과 동일한 계산
                
                return sectionPair.map((section, sectionIndex) => {
                  const rackWidth = 2.8 // 랙 너비와 동일하게
                  const headerX = columnStartX + (sectionIndex * (rackWidth + 0.8)) + (rackWidth / 2) // 각 랙의 중앙
                  
                  return (
                    <div key={`${colIndex}-${section}`} className="absolute top-2" style={{
                      left: `${headerX}%`,
                      width: `${rackWidth}%`, // 랙 너비와 일치
                      transform: 'translateX(-50%)' // 중앙 정렬
                    }}>
                      <div className="text-xs font-bold text-gray-800 bg-white px-1 py-1 rounded-md shadow-sm border border-gray-200 text-center">
                        {section}
                      </div>
                    </div>
                  )
                })
              }).flat()}
              
            </div>
            
            {/* 클릭 가능한 랙 영역들 */}
            {RACK_POSITIONS.map((rackPos) => {
              const rackInfo = getRackInfo(rackPos.section, rackPos.position)
              const hasItems = hasRackInventory(rackPos.section, rackPos.position)
              const rackCode = `${rackPos.section}${rackPos.position.toString().padStart(3, '0')}`
              const inventoryCount = rackInfo?.inventories?.length ?? 0
              
              return (
                <div
                  key={`${rackPos.section}-${rackPos.position}`}
                  className={`
                    group absolute cursor-pointer transition-all duration-200
                    border-2 hover:border-blue-600 hover:z-10 hover:scale-105
                    ${hasItems 
                      ? 'bg-emerald-500 border-emerald-300 hover:bg-emerald-600 shadow-emerald-200' 
                      : 'bg-gray-300 border-gray-200 hover:bg-gray-400 shadow-gray-100'
                    }
                    rounded-md shadow-md hover:shadow-lg
                  `}
                  style={{
                    left: `${rackPos.x}%`,
                    top: `${rackPos.y}%`,
                    width: `${rackPos.width}%`,
                    height: `${rackPos.height}%`,
                  }}
                  onClick={() => handleRackClick(rackPos.section, rackPos.position)}
                  title={`랙 ${rackCode} - ${hasItems ? `${inventoryCount}개 아이템` : '재고 없음'}`}
                >
                  {/* 기본 상태: 섹션과 위치 번호 표시 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] font-semibold text-white drop-shadow-sm">
                      {rackPos.section}{rackPos.position.toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  {/* 호버 시: 상세 정보 */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800/95 rounded-md flex flex-col items-center justify-center">
                    <div className="text-[10px] font-bold text-white">{rackCode}</div>
                    {hasItems && (
                      <div className="text-[8px] text-emerald-300 font-medium">{inventoryCount}개</div>
                    )}
                    {!hasItems && (
                      <div className="text-[8px] text-gray-400">빈 랙</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* 범례 */}
          <div className="flex items-center gap-6 mt-6 justify-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-5 h-5 bg-emerald-500 border-2 border-emerald-300 rounded-md shadow-sm"></div>
              <span className="text-sm font-medium">활성(재고 있음)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="w-5 h-5 bg-gray-300 border-2 border-gray-200 rounded-md shadow-sm"></div>
              <span className="text-sm font-medium">비활성(재고 없음)</span>
            </div>
          </div>
          
        </CardContent>
      </Card>

      {/* 랙 정보 모달 */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              랙 {selectedRack} 재고 정보
              <Badge variant={selectedRackInventory.length > 0 ? "default" : "secondary"}>
                {selectedRackInventory.length > 0 ? "재고 있음" : "재고 없음"}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 랙 정보 */}
            {selectedRackInfo && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">랙 코드:</span> {selectedRackInfo.rackCode}
                    </div>
                    <div>
                      <span className="font-medium">섹션:</span> {selectedRackInfo.section}
                    </div>
                    <div>
                      <span className="font-medium">위치:</span> {selectedRackInfo.position}
                    </div>
                    <div>
                      <span className="font-medium">상태:</span> 
                      <Badge variant={selectedRackInfo.isActive ? "default" : "secondary"} className="ml-2">
                        {selectedRackInfo.isActive ? "활성" : "비활성"}
                      </Badge>
                    </div>
                    {selectedRackInfo.description && (
                      <div className="col-span-2">
                        <span className="font-medium">설명:</span> {selectedRackInfo.description}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 요약 정보 */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">총 아이템</p>
                      <p className="text-2xl font-bold">{selectedRackTotalItems}개</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">총 수량</p>
                      <p className="text-2xl font-bold">{selectedRackTotalQuantity}개</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">랙 위치</p>
                      <p className="text-2xl font-bold">{selectedRack}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 상세 재고 목록 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">상세 재고 목록</h3>
              {rackInventoryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">재고 정보를 불러오는 중...</p>
                </div>
              ) : selectedRackInventory.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 font-medium text-sm">
                    <div>품목명</div>
                    <div>품목코드</div>
                    <div>수량</div>
                    <div>랙 위치</div>
                    <div>최종 업데이트</div>
                  </div>
                  {selectedRackInventory.map((item, index) => (
                    <div key={item.id} className={`grid grid-cols-5 gap-4 p-3 text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="font-medium">{item.itemName}</div>
                      <div className="text-muted-foreground">{item.itemCode}</div>
                      <div className="font-medium">{item.quantity}개</div>
                      <div className="text-blue-600">{item.rackCode}</div>
                      <div className="text-muted-foreground">
                        {new Date(item.lastUpdated).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>이 랙에는 재고가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}