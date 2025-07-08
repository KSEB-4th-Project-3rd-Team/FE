// 품목 관련 타입 정의
export interface Item {
  id: string
  code: string
  name: string
  group: string
  specification: string
  barcode: string
  inboundPrice: number
  outboundPrice: number
  createdAt: string
}

// 로컬 스토리지 키
const ITEMS_KEY = "wms_items"

// 품목 데이터 관리 함수들
export const itemService = {
  // 모든 품목 가져오기
  getItems(): Item[] {
    const items = localStorage.getItem(ITEMS_KEY)
    return items ? JSON.parse(items) : []
  },

  // 품목 저장
  saveItems(items: Item[]) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
  },

  // 품목 추가
  addItem(item: Omit<Item, "id" | "createdAt">): Item {
    const items = this.getItems()
    const newItem: Item = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    items.push(newItem)
    this.saveItems(items)
    return newItem
  },

  // 품목 수정
  updateItem(id: string, item: Partial<Item>) {
    const items = this.getItems()
    const index = items.findIndex((i) => i.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...item }
      this.saveItems(items)
    }
  },

  // 품목 삭제
  deleteItem(id: string) {
    const items = this.getItems()
    const filteredItems = items.filter((item) => item.id !== id)
    this.saveItems(filteredItems)
  },
}
