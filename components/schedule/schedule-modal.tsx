"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Calendar, MapPin, Clock, Loader2 } from "lucide-react"
import { createSchedule, type Schedule, type CreateScheduleRequest } from "@/lib/api"
import { toast } from "sonner"
import { queryKeys } from "@/lib/react-query"

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onScheduleAdded: () => void
  selectedDate?: string
}

export default function ScheduleModal({ isOpen, onClose, onScheduleAdded, selectedDate }: ScheduleModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    type: "MEETING" as const,
  })

  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, [selectedDate, isOpen]);


  const { mutate: create, isPending } = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      toast.success("일정이 성공적으로 등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules() });
      queryClient.invalidateQueries({ queryKey: ['dashboard-all'] });
      onScheduleAdded();
      onClose();
    },
    onError: (error) => {
      toast.error(`일정 등록 실패: ${error.message}`);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      toast.warning("제목, 날짜, 시작시간, 종료시간을 모두 입력해주세요.");
      return
    }

    const scheduleRequest: CreateScheduleRequest = {
      title: formData.title,
      startTime: `${formData.date}T${formData.startTime}:00`,
      endTime: `${formData.date}T${formData.endTime}:00`,
      type: formData.type,
    }
    create(scheduleRequest);
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              일정 등록
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="일정 제목을 입력하세요"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="date">날짜 *</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required disabled={isPending} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">시작 시간 *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endTime">종료 시간 *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="type">유형</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isPending}
              >
                <option value="INBOUND">입고</option>
                <option value="OUTBOUND">출고</option>
                <option value="INVENTORY_CHECK">재고점검</option>
                <option value="MEETING">회의</option>
                <option value="ETC">기타</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                등록
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isPending}>
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}