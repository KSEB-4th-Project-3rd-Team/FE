"use client"

import WarehouseMap from "@/components/warehouse/warehouse-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Warehouse } from "lucide-react"

export default function WarehouseMapPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">창고 현황</h2>
      </div>
      
      <WarehouseMap />
    </div>
  )
}