"use client"

import ItemList from "@/components/item/item-list"
import { useData } from "@/contexts/data-context"
import ItemListSkeleton from "@/components/item/item-list-skeleton"
import ErrorMessage from "@/components/ui/error-message"

export default function ItemListPage() {
  const { items, loading, error, reloadData } = useData()

  if (loading) return <ItemListSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={() => reloadData("items")} />

  return <ItemList items={items} setItems={() => reloadData("items")} />
}
