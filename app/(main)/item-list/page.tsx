"use client"

import { useState, useEffect } from "react"
import ItemList from "@/components/item/item-list"
import type { Item } from "@/components/item/item-list"
import { fetchItems } from "@/lib/api"

export default function ItemListPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true)
        const fetchedItems = await fetchItems();
        setItems(fetchedItems);
      } catch (err) {
        setError("Failed to load items.");
        console.error(err);
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return <ItemList items={items} setItems={setItems} />
}
