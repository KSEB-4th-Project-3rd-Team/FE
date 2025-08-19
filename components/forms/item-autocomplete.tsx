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
  

  const itemOptions = React.useMemo(() => items.map(item => ({
    id: item.itemId,
    value: item.itemName ? item.itemName.toLowerCase() : '',
    label: item.itemName || '',
  })), [items]);

  const selectedItem = React.useMemo(() => itemOptions.find((item) => {
    if (typeof value === 'number') {
      return item.id === value;
    } else if (typeof value === 'string' && value !== null) {
      return item.value === value.toLowerCase();
    }
    return false;
  }), [itemOptions, value]);


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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[9999]" align="start" style={{ maxHeight: '300px' }}>
        <Command style={{ pointerEvents: 'auto' }}>
          <CommandInput placeholder="품목 검색..." />
          <div 
            style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              overflowX: 'hidden',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 1000
            }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <CommandEmpty>해당 품목이 없습니다.</CommandEmpty>
            <CommandGroup>
            {itemOptions.map((item, index) => (
              <CommandItem
                key={item.id || `item-${index}`}
                value={String(item.id)}
                onClick={() => {
                  const newValue = item.id === value ? null : item.id;
                  onValueChange(newValue);
                  setOpen(false)
                }}
                onSelect={(selectedValue) => {
                  const newValue = item.id === value ? null : item.id;
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
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
