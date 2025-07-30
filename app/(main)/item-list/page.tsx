import ItemList from "@/components/item/item-list"
import { fetchItems } from "@/lib/api"

export default async function ItemListPage() {
  const items = await fetchItems();

  return <ItemList initialItems={items} />
}
