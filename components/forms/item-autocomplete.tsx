"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/components/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Item } from "@/components/item/item-list"

interface ItemAutocompleteProps {
  id?: string;
  items: Item[];
  value: string | number | null; // Allow string (name) or number (id) or null
  onValueChange: (value: string | number | null) => void;
}

export function ItemAutocomplete({ id, items, value, onValueChange }: ItemAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  
  // console.log("ItemAutocomplete rendered:");
  // console.log("- value:", value, "(type:", typeof value, ")");
  // console.log("- items count:", items.length);
  // console.log("- first item:", items[0]);

  const itemOptions = React.useMemo(() => items.map(item => ({
    id: item.itemId,
    value: item.itemName ? item.itemName.toLowerCase() : '',
    label: item.itemName || '',
  })), [items]);

  const selectedItem = React.useMemo(() => itemOptions.find((item) => {
    if (typeof value === 'number') {
      return item.id === value;
    } else if (typeof value === 'string') {
      return item.value === value.toLowerCase();
    }
    return false;
  }), [itemOptions, value]);

  // console.log("ItemAutocomplete render - open:", open, "value:", value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItem
            ? selectedItem.label
            : "품목을 선택하세요..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[9999]" align="start">
        <Command>
          <CommandInput placeholder="품목 검색..." />
          <CommandList>
            <CommandEmpty>해당 품목이 없습니다.</CommandEmpty>
            <CommandGroup>
            {itemOptions.map((item, index) => (
              <CommandItem
                key={item.id || `item-${index}`}
                value={String(item.id)}
                // onMouseEnter={() => console.log("Item onMouseEnter:", item.id)}
                onClick={() => {
                  console.log("Item onClick triggered! itemId:", item.id, "prevValue:", value);
                  const newValue = item.id === value ? null : item.id;
                  console.log("Calling onValueChange with:", newValue, "(type:", typeof newValue, ")");
                  onValueChange(newValue);
                  setOpen(false)
                }}
                onSelect={(selectedValue) => {
                  console.log("Item onSelect triggered! selectedValue:", selectedValue, "itemId:", item.id, "prevValue:", value);
                  const newValue = item.id === value ? null : item.id;
                  console.log("Calling onValueChange with:", newValue, "(type:", typeof newValue, ")");
                  onValueChange(newValue);
                  setOpen(false)
                }}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                style={{pointerEvents: 'auto'}}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    item.id === value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
