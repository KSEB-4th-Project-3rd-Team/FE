"use client"

import { useState, useEffect } from "react"
import ItemList from "@/components/item/item-list"
import type { Item } from "@/components/item/item-list"

export default function ItemListPage() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    // TODO: Fetch items from API
    // const fetchedItems = await fetchItems();
    // setItems(fetchedItems);
  }, [])

  return <ItemList items={items} setItems={setItems} />
}
