"use client"

import type React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ItemAutocomplete } from "./item-autocomplete"
import { CompanyAutocomplete } from "./company-autocomplete"
import { CalendarIcon, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/components/utils"
import { useCompanies, useCreateOutboundOrder, useItems, useRacks } from "@/lib/queries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { toast } from "sonner"

// Zod 스키마 정의
const formSchema = z.object({
  companyId: z.number({ required_error: "거래처를 선택해주세요." }),
  expectedDate: z.date({ required_error: "예정일을 선택해주세요." }),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.number({ required_error: "상품명을 선택해주세요." }),
    quantity: z.coerce.number().min(1, "수량은 1 이상이어야 합니다."),
    locationCode: z.string({ required_error: "재고 위치를 선택해주세요." })
  })).min(1, "하나 이상의 품목을 추가해야 합니다."),
})

type OutboundFormValues = z.infer<typeof formSchema>

interface OutboundFormProps {
  onClose: () => void;
}

export default function OutboundForm({ onClose }: OutboundFormProps) {
  const { data: itemsData } = useItems();
  const { data: companiesData } = useCompanies();
  const { data: racksData } = useRacks();
  const createOrderMutation = useCreateOutboundOrder();

  // useRacks 데이터를 출고 폼에 맞는 형태로 가공
  const allInventoryLocations = racksData?.flatMap(rack => 
    rack.inventories?.map(inv => ({
      ...inv,
      locationCode: rack.rackCode // 각 재고 항목에 랙 코드를 명시적으로 추가
    })) || []
  ) || [];

  const form = useForm<OutboundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: undefined,
      expectedDate: new Date(),
      notes: "",
      items: [{ itemId: undefined, quantity: 1, locationCode: undefined }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = form.watch("items");

  const onSubmit = (data: OutboundFormValues) => {
    const payload = {
      ...data,
      expectedDate: format(data.expectedDate, "yyyy-MM-dd"),
      type: 'OUTBOUND',
      status: 'PENDING',
      items: data.items.map(item => ({
        itemId: item.itemId,
        requestedQuantity: item.quantity,
        locationCode: item.locationCode,
      }))
    };

    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("출고 등록이 성공적으로 완료되었습니다.");
        onClose();
      },
      onError: (error) => {
        toast.error(`오류가 발생했습니다: ${error.message}`);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>거래처 *</FormLabel>
                <FormControl>
                  <CompanyAutocomplete
                    companies={companiesData || []}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expectedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>예정일 *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "yyyy-MM-dd") : <span>날짜 선택</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">품목 정보</h3>
          <div className="space-y-4">
            {fields.map((field, index) => {
              const selectedItemId = watchedItems[index]?.itemId;
              const availableLocations = allInventoryLocations.filter(inv => inv.itemId === selectedItemId) || [];

              return (
                <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>상품명 *</FormLabel>
                          <FormControl>
                            <ItemAutocomplete
                              items={itemsData || []}
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue(`items.${index}.locationCode`, undefined);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.locationCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>재고 위치 *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedItemId || availableLocations.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  !selectedItemId 
                                    ? "품목을 먼저 선택하세요" 
                                    : availableLocations.length === 0
                                      ? "사용 가능한 재고 없음"
                                      : "위치를 선택하세요"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableLocations.map(loc => (
                                <SelectItem key={loc.locationCode} value={loc.locationCode}>
                                  {`${loc.locationCode} (재고: ${loc.quantity})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>출고 수량 *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="mt-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => append({ itemId: undefined, quantity: 1, locationCode: undefined })}
          >
            + 품목 추가
          </Button>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비고</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="추가 정보를 입력하세요"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            출고 등록
          </Button>
        </div>
      </form>
    </Form>
  )
}
