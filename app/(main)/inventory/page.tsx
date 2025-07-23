"use client"

import { useState, useEffect } from "react"
import InventoryManagement from "@/components/inventory/inventory-management"
import { InventoryItem } from "@/components/utils"
import { fetchInventoryData } from "@/lib/api"

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInventoryData = async () => {
      try {
        setLoading(true)
        const fetchedInventoryData = await fetchInventoryData();
        setInventoryData(fetchedInventoryData);
      } catch (err) {
        setError("Failed to load inventory data.");
        console.error(err);
      } finally {
        setLoading(false)
      }
    }
    loadInventoryData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return <InventoryManagement data={inventoryData} />
}
