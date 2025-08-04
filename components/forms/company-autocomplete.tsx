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
import { Company } from "@/components/company/company-list"

interface CompanyAutocompleteProps {
  id?: string;
  value: string | number | null;
  onValueChange: (value: string | number | null) => void;
  companies: Company[];
}

export function CompanyAutocomplete({ id, value, onValueChange, companies }: CompanyAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  
  // console.log("CompanyAutocomplete rendered:");
  // console.log("- value:", value, "(type:", typeof value, ")");
  // console.log("- companies count:", companies.length);
  // console.log("- first company:", companies[0]);

  const companyOptions = React.useMemo(() => Array.isArray(companies) ? companies.map(company => ({
    id: company.companyId,
    value: company.companyName ? company.companyName.toLowerCase() : '',
    label: company.companyName || '',
  })) : [], [companies]);

  const selectedCompany = React.useMemo(() => companyOptions.find((company) => {
    if (typeof value === 'number') {
      return company.id === value;
    } else if (typeof value === 'string' && value !== null) {
      return company.value === value.toLowerCase();
    }
    return false;
  }), [companyOptions, value]);

  // console.log("CompanyAutocomplete render - open:", open, "value:", value);

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
          {selectedCompany
            ? selectedCompany.label
            : "거래처를 선택하세요..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[9999]" align="start">
        <Command>
          <CommandInput placeholder="거래처 검색..." />
          <CommandList>
            <CommandEmpty>해당 거래처가 없습니다.</CommandEmpty>
            <CommandGroup>
            {companyOptions.map((company, index) => (
              <CommandItem
                key={company.id || `company-${index}`}
                value={String(company.id)}
                // onMouseEnter={() => console.log("Company onMouseEnter:", company.id)}
                onClick={() => {
                  console.log("Company onClick triggered! companyId:", company.id, "prevValue:", value);
                  const newValue = company.id === value ? null : company.id;
                  console.log("Calling onValueChange with:", newValue, "(type:", typeof newValue, ")");
                  onValueChange(newValue);
                  setOpen(false)
                }}
                onSelect={(selectedValue) => {
                  console.log("Company onSelect triggered! selectedValue:", selectedValue, "companyId:", company.id, "prevValue:", value);
                  const newValue = company.id === value ? null : company.id;
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
                    company.id === value ? "opacity-100" : "opacity-0"
                  )}
                />
                {company.label}
              </CommandItem>
            ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
