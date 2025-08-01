import ItemList from "@/components/item/item-list"
import { fetchItems } from "@/lib/api"

// Disable static generation and caching for dynamic content
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ItemListPage() {
  const items = await fetchItems();

  return <ItemList initialItems={items} />
}
