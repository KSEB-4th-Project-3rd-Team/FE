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
import { Company } from "@/components/company/company-list"

interface CompanyAutocompleteProps {
  value: string | number;
  onValueChange: (value: string | number) => void;
  companies: Company[];
}

export function CompanyAutocomplete({ value, onValueChange, companies }: CompanyAutocompleteProps) {
  const [open, setOpen] = React.useState(false)

  const companyOptions = Array.isArray(companies) ? companies.map(company => ({
    id: company.id,
    value: typeof company.name === 'string' ? company.name.toLowerCase() : '',
    label: company.name,
  })) : [];

  const selectedCompany = companyOptions.find((company) => company.id === value || (typeof value === 'string' && company.value === value.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCompany
            ? selectedCompany.label
            : "거래처를 선택하세요..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="거래처 검색..." />
          <CommandEmpty>해당 거래처가 없습니다.</CommandEmpty>
          <CommandGroup>
            {companyOptions.map((company) => (
              <CommandItem
                key={company.id}
                value={company.value}
                onSelect={(currentValue) => {
                  onValueChange(company.id === value ? "" : company.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    company.id === value ? "opacity-100" : "opacity-0"
                  )}
                />
                {company.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
