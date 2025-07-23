"use client"

import { useState, useEffect } from "react"
import InventoryManagement from "@/components/inventory/inventory-management"
import { InventoryItem } from "@/components/utils"

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])

  useEffect(() => {
    // TODO: Fetch inventory data from API
    // const fetchedInventoryData = await fetchInventoryData();
    // setInventoryData(fetchedInventoryData);
  }, [])

  return <InventoryManagement data={inventoryData} />
}
