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
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Item } from "@/components/item/item-list"

interface ItemAutocompleteProps {
  items: Item[];
  value: string | number; // Allow string (name) or number (id)
  onValueChange: (value: string | number) => void;
}

export function ItemAutocomplete({ items, value, onValueChange }: ItemAutocompleteProps) {
  const [open, setOpen] = React.useState(false)

  const itemOptions = items.map(item => ({
    id: item.itemId,
    value: item.itemName ? item.itemName.toLowerCase() : '',
    label: item.itemName || '',
  }));

  const selectedItem = itemOptions.find((item) => item.id === value || item.value === (value as string)?.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="품목 검색..." />
          <CommandEmpty>해당 품목이 없습니다.</CommandEmpty>
          <CommandGroup>
            {itemOptions.map((item, index) => (
              <CommandItem
                key={item.id || `item-${index}`}
                value={item.value}
                onSelect={(currentValue) => {
                  onValueChange(item.id === value ? "" : item.id) // Return ID
                  setOpen(false)
                }}
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
        </Command>
      </PopoverContent>
    </Popover>
  )
}
