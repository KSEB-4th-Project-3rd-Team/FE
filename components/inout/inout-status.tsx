"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InOutStatusDialog from "./inout-status-dialog"

interface InOutData {
  id: number
  type: "입고" | "출고"
  item: string
  quantity: number
  status: "완료" | "진행중" | "예약"
  date: string
}

const initialData: InOutData[] = [
  { id: 1, type: "입고", item: "노트북", quantity: 10, status: "완료", date: "2024-07-15" },
  { id: 2, type: "출고", item: "모니터", quantity: 5, status: "완료", date: "2024-07-15" },
  { id: 3, type: "입고", item: "키보드", quantity: 20, status: "진행중", date: "2024-07-16" },
  { id: 4, type: "출고", item: "마우스", quantity: 15, status: "예약", date: "2024-07-17" },
  { id: 5, type: "입고", item: "도킹 스테이션", quantity: 8, status: "완료", date: "2024-07-14" },
  { id: 6, type: "출고", item: "웹캠", quantity: 12, status: "진행중", date: "2024-07-16" },
  { id: 7, type: "입고", item: "헤드셋", quantity: 25, status: "예약", date: "2024-07-18" },
  { id: 8, type: "출고", item: "USB 허브", quantity: 30, status: "완료", date: "2024-07-13" },
]

export function InOutStatus() {
  const [data] = useState<InOutData[]>(initialData)
  const [selectedItem, setSelectedItem] = useState<InOutData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleRowClick = (item: InOutData) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedItem(null)
  }

  const getFilteredData = (filter: string) => {
    let filteredData: InOutData[];

    if (filter === "all") filteredData = data
    else if (filter === "inbound")
      filteredData = data.filter(item => item.type === "입고")
    else if (filter === "outbound")
      filteredData = data.filter(item => item.type === "출고")
    else if (filter === "pending")
      filteredData = data.filter(item => item.status === "예약" || item.status === "진행중")
    else if (filter === "completed")
      filteredData = data.filter(item => item.status === "완료")
    else filteredData = data;

    return filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const renderTable = (filter: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>유형</TableHead>
          <TableHead>품목</TableHead>
          <TableHead>수량</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>날짜</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {getFilteredData(filter).map(item => (
          <TableRow key={item.id} onClick={() => handleRowClick(item)}>
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.item}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>{item.status}</TableCell>
            <TableCell>{item.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>실시간 입출고</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <TabsTrigger value="inbound">입고</TabsTrigger>
            <TabsTrigger value="outbound">출고</TabsTrigger>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <TabsTrigger value="pending">진행중 예약</TabsTrigger>
            <TabsTrigger value="completed">완료</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderTable("all")}</TabsContent>
          <TabsContent value="inbound">{renderTable("inbound")}</TabsContent>
          <TabsContent value="outbound">{renderTable("outbound")}</TabsContent>
          <TabsContent value="pending">{renderTable("pending")}</TabsContent>
          <TabsContent value="completed">{renderTable("completed")}</TabsContent>
        </Tabs>
        {selectedItem && (
          <InOutStatusDialog
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            data={[]}
          />
        )}
      </CardContent>
    </Card>
  )
}
