"use client"

import { useState } from "react"
import { InOutRecord } from "@/components/utils"

interface InOutStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: InOutRecord[];
}

export default function InOutStatusDialog({ isOpen, onClose, data }: InOutStatusDialogProps) {
  const [statusFilters, setStatusFilters] = useState({
    type: "",
    productName: "",
    location: "",
    status: "",
    company: "",
    date: "",
  })

  const filteredStatus = data.filter((item) => {
    const typeMatch = statusFilters.type === "" || item.type === statusFilters.type
    const productNameMatch = item.productName.toLowerCase().includes(statusFilters.productName.toLowerCase())
    const locationMatch = item.location.toLowerCase().includes(statusFilters.location.toLowerCase())
    const statusMatch = statusFilters.status === "" || item.status === statusFilters.status
    const companyMatch = item.company.toLowerCase().includes(statusFilters.company.toLowerCase())
    const dateMatch = statusFilters.date === "" || item.date === statusFilters.date

    return typeMatch && productNameMatch && locationMatch && statusMatch && companyMatch && dateMatch
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">입출고 현황</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">유형</th>
                <th className="text-left p-3 font-semibold">상품명</th>
                <th className="text-center p-3 font-semibold">수량</th>
                <th className="text-center p-3 font-semibold">위치</th>
                <th className="text-center p-3 font-semibold">상태</th>
                <th className="text-left p-3 font-semibold">거래처</th>
                <th className="text-center p-3 font-semibold">날짜</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatus.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === "inbound" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                    }`}>
                      {item.type === "inbound" ? "입고" : "출고"}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{item.productName}</td>
                  <td className="p-3 text-center font-semibold">{item.quantity.toLocaleString()}개</td>
                  <td className="p-3 text-center">{item.location}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "예약" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">{item.company}</td>
                  <td className="p-3 text-center">
                    <div>
                      <p className="text-sm">{item.date}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStatus.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>해당하는 현황이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}