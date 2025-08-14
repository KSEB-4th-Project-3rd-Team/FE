"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, MapPin, BarChart3, Zap, ZapOff, RefreshCw } from "lucide-react"
import { InventoryItem } from "@/components/utils"
import { useQueryData } from "@/contexts/query-data-context"
import { useRawInventoryData, useRawInOutData } from "@/lib/queries"

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
  const { inventoryData: contextInventory } = useQueryData()
  const { data: rawInventoryData = [], isLoading: rawInventoryLoading, refetch: refetchInventory } = useRawInventoryData()
  const { data: rawInOutData = [], isLoading: inOutLoading, refetch: refetchInOut } = useRawInOutData()
  
  // 30초마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('창고맵 자동 새로고침 실행...')
      refetchInventory()
      refetchInOut()
    }, 30000) // 30초
    
    return () => clearInterval(interval)
  }, [refetchInventory, refetchInOut])
  const [selectedRack, setSelectedRack] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  console.log('=== 창고맵 입출고 기반 재고 계산 ===')
  console.log('전체 입출고 데이터:', rawInOutData.length, '개')
  console.log('현재 시간:', new Date().toLocaleTimeString(), '- 창고맵 리렌더링됨')
  
  // status별 개수 확인
  const statusCounts = rawInOutData.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('status별 개수:', statusCounts)
  
  const isLoading = rawInventoryLoading || inOutLoading

  // 입출고 내역을 기반으로 현재 재고 위치 계산
  const rackInventoryMap = useMemo(() => {
    const map: Record<string, any[]> = {}
    
    console.log('=== 입출고 기반 재고 계산 ===')
    
    // 완료된 입출고 내역만 필터링 (대소문자 구분 없이)
    const completedInOut = rawInOutData.filter(order => 
      order.status?.toLowerCase() === 'completed'
    )
    console.log('완료된 입출고 주문 수:', completedInOut.length)
    
    // 방금 완료된 주문들 (최근 10개) 확인
    const recentOrders = completedInOut.slice(-10)
    console.log('최근 완료된 10개 주문의 locationCode:')
    recentOrders.forEach(order => {
      console.log(`주문 ${order.orderId}: locationCode="${order.locationCode}", 타입=${order.type}`)
    })
    
    // 모든 완료된 주문의 locationCode들 확인
    const allLocationCodes = completedInOut.map(order => order.locationCode).filter(Boolean)
    const uniqueLocationCodes = [...new Set(allLocationCodes)]
    console.log('완료된 주문의 모든 locationCode들:', uniqueLocationCodes)
    
    // I009의 모든 상태별 주문 확인
    const i009AllOrders = rawInOutData.filter(order => order.locationCode === 'I009')
    console.log('I009의 모든 주문들 (상태별):')
    const i009StatusCounts = i009AllOrders.reduce((acc, order) => {
      const key = `${order.status}-${order.type}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log('I009 상태별 개수:', i009StatusCounts)
    
    // 가장 최근 I009 주문들 보기
    const recentI009Orders = i009AllOrders.slice(-5)
    console.log('I009의 최근 5개 주문:')
    recentI009Orders.forEach(order => {
      console.log(`주문 ${order.orderId}: ${order.type} - ${order.status}`)
    })
    
    // 각 품목별 랙 위치별 재고 계산
    const rackItemQuantities: Record<string, Record<number, number>> = {} // rackCode -> {itemId: quantity}
    
    completedInOut.forEach(order => {
      const locationCode = order.locationCode || ''
      let rackCode = locationCode.replace('-', '').toUpperCase()
      
      // 패딩 처리: I9 → I009
      if (rackCode.match(/^[A-T]\d{1,2}$/)) {
        const section = rackCode.charAt(0)
        const position = rackCode.slice(1).padStart(3, '0')
        rackCode = `${section}${position}`
      }
      
      // I009 관련 주문만 특별히 로그
      if (rackCode === 'I009' || locationCode.includes('I009') || locationCode.includes('I9')) {
        console.log(`🔍 I009 관련 주문 발견! 주문 ${order.orderId}: locationCode="${locationCode}" → rackCode="${rackCode}"`)
        console.log('이 주문의 타입:', order.type, '상태:', order.status)
        console.log('이 주문의 아이템들:', order.items)
      }
      
      if (!rackCode) {
        return
      }
      
      order.items?.forEach(item => {
        if (!rackItemQuantities[rackCode]) {
          rackItemQuantities[rackCode] = {}
        }
        
        const currentQty = rackItemQuantities[rackCode][item.itemId] || 0
        
        if (order.type === 'INBOUND') {
          // 입고: 수량 증가
          rackItemQuantities[rackCode][item.itemId] = currentQty + item.requestedQuantity
        } else if (order.type === 'OUTBOUND') {
          // 출고: 수량 감소
          rackItemQuantities[rackCode][item.itemId] = Math.max(0, currentQty - item.requestedQuantity)
        }
        
        // I009 관련된 수량 변경만 특별히 로그
        if (rackCode === 'I009') {
          console.log(`🔍 I009 수량 변경: ${order.type} - 품목 ${item.itemName}, ${currentQty} → ${rackItemQuantities[rackCode][item.itemId]}`)
        }
      })
    })
    
    console.log('랙별 품목 수량 맵:', rackItemQuantities)
    
    // 최종 랙 맵 생성 (수량이 0보다 큰 것만)
    Object.entries(rackItemQuantities).forEach(([rackCode, itemQuantities]) => {
      Object.entries(itemQuantities).forEach(([itemIdStr, quantity]) => {
        if (quantity > 0) {
          const itemId = parseInt(itemIdStr)
          const completedOrder = completedInOut.find(order => 
            order.items?.some(item => item.itemId === itemId)
          )
          const itemData = completedOrder?.items?.find(item => item.itemId === itemId)
          
          if (itemData) {
            if (!map[rackCode]) {
              map[rackCode] = []
            }
            map[rackCode].push({
              itemId,
              itemName: itemData.itemName,
              quantity,
              locationCode: rackCode,
              lastUpdated: completedOrder.updatedAt || completedOrder.createdAt
            })
          }
        }
      })
    })
    
    console.log('최종 입출고 기반 랙 맵:', map)
    console.log('활성 랙 수:', Object.keys(map).length)
    console.log('활성 랙 목록:', Object.keys(map))
    
    // I009 랙 특별히 확인
    if (map['I009']) {
      console.log('I009 랙 재고:', map['I009'])
    } else {
      console.log('I009 랙에 재고가 없음')
    }
    
    return map
  }, [rawInOutData])

  // 랙에 재고가 있는지 확인
  const hasRackInventory = (section: string, position: number): boolean => {
    const rackCode = `${section}${position.toString().padStart(3, '0')}`
    const rackItems = rackInventoryMap[rackCode] || []
    const hasInventory = rackItems.length > 0 && rackItems.some(item => item.quantity > 0)
    
    // I009 랙 특별히 디버그
    if (rackCode === 'I009') {
      console.log(`I009 랙 체크: rackItems=${rackItems.length}개, hasInventory=${hasInventory}`)
      console.log('I009 rackItems:', rackItems)
    }
    
    return hasInventory
  }

  // 활성/비활성 랙 계산
  const activeRackCodes = Object.keys(rackInventoryMap).filter(rackCode => {
    const items = rackInventoryMap[rackCode] || []
    return items.some(item => item.quantity > 0)
  })
  
  const totalRacks = 20 * 12 // A~T (20개) * 1~12 (12개) = 240개
  const totalInventoryRacks = activeRackCodes.length
  const totalEmptyRacks = totalRacks - totalInventoryRacks

  const handleRackClick = (section: string, position: number) => {
    const rackCode = `${section}${position.toString().padStart(3, '0')}`
    setSelectedRack(rackCode)
    setShowModal(true)
  }

  // 선택된 랙의 재고 정보 (rackInventoryMap에서 직접 가져오기)
  const selectedRackInventory = selectedRack ? (rackInventoryMap[selectedRack] || []) : []
  const selectedRackTotalQuantity = selectedRackInventory.reduce((sum, item) => sum + item.quantity, 0)
  const selectedRackTotalItems = selectedRackInventory.length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">재고 정보를 불러오는 중...</p>
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
                {totalInventoryRacks}
              </div>
              <div className="text-sm text-muted-foreground">활성 랙</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {totalEmptyRacks}
              </div>
              <div className="text-sm text-muted-foreground">비활성 랙</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {totalInventoryRacks}
              </div>
              <div className="text-sm text-muted-foreground">재고 있는 랙</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {totalRacks}
              </div>
              <div className="text-sm text-muted-foreground">총 랙 수</div>
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
              const hasItems = hasRackInventory(rackPos.section, rackPos.position)
              const rackCode = `${rackPos.section}${rackPos.position.toString().padStart(3, '0')}`
              
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
                  title={`랙 ${rackCode} - ${hasItems ? '재고 있음' : '재고 없음'}`}
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
                      <div className="text-[8px] text-emerald-300 font-medium">재고 있음</div>
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
            {selectedRack && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">랙 코드:</span> {selectedRack}
                    </div>
                    <div>
                      <span className="font-medium">섹션:</span> {selectedRack?.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium">위치:</span> {selectedRack?.slice(1)}
                    </div>
                    <div>
                      <span className="font-medium">상태:</span> 
                      <Badge variant="default" className="ml-2">활성</Badge>
                    </div>
                    <div>
                      <span className="font-medium">재고 유무:</span> 
                      <Badge variant={selectedRackInventory.length > 0 ? "default" : "secondary"} className="ml-2">
                        {selectedRackInventory.length > 0 ? "재고 있음" : "재고 없음"}
                      </Badge>
                    </div>
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
              {selectedRackInventory.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 font-medium text-sm">
                    <div>품목명</div>
                    <div>품목코드</div>
                    <div>수량</div>
                    <div>랙 위치</div>
                    <div>최종 업데이트</div>
                  </div>
                  {selectedRackInventory.map((item, index) => (
                    <div key={`${item.itemId}-${index}`} className={`grid grid-cols-5 gap-4 p-3 text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="font-medium">{item.itemName}</div>
                      <div className="text-muted-foreground">SKU-{item.itemId}</div>
                      <div className="font-medium">{item.quantity}개</div>
                      <div className="text-blue-600">{item.locationCode}</div>
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