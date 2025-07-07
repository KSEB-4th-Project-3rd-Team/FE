"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface CalendarHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export default function CalendarHeader({ currentDate, onDateChange }: CalendarHeaderProps) {
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const yearDropdownRef = useRef<HTMLDivElement>(null)

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // 현재 연도를 중심으로 -10년부터 +10년 범위의 연도 생성
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  const previousMonth = () => {
    onDateChange(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    onDateChange(new Date(currentYear, currentMonth + 1, 1))
  }

  const selectYear = (year: number) => {
    onDateChange(new Date(year, currentMonth, 1))
    setShowYearDropdown(false)
  }

  const selectMonth = (month: number) => {
    onDateChange(new Date(currentYear, month, 1))
    setShowMonthDropdown(false)
  }

  useEffect(() => {
    if (showYearDropdown && yearDropdownRef.current) {
      // DOM이 완전히 렌더링된 후 스크롤 조정
      const adjustScroll = () => {
        if (!yearDropdownRef.current) return

        // 현재 연도의 인덱스 찾기
        const currentYearIndex = years.findIndex((year) => year === currentYear)
        if (currentYearIndex !== -1) {
          // 각 버튼의 높이는 대략 40px (py-2 + border)
          const buttonHeight = 40
          const dropdownHeight = 192 // max-h-48 = 192px

          // 현재 연도가 중앙에 오도록 스크롤 위치 계산
          const scrollTop = currentYearIndex * buttonHeight - dropdownHeight / 2 + buttonHeight / 2

          // 드롭다운 컨테이너 내에서만 스크롤
          yearDropdownRef.current.scrollTop = Math.max(0, scrollTop)
        }
      }

      // 다음 프레임에서 스크롤 조정 (DOM 렌더링 완료 후)
      requestAnimationFrame(adjustScroll)
    }
  }, [showYearDropdown, currentYear])

  return (
    <div className="flex items-center justify-between mb-4">
      <Button variant="outline" size="sm" onClick={previousMonth}>
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-2">
        {/* 연도 선택 */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowYearDropdown(!showYearDropdown)
              setShowMonthDropdown(false)
            }}
            className="flex items-center gap-1"
          >
            {currentYear}년
            <ChevronDown className="w-3 h-3" />
          </Button>

          {showYearDropdown && (
            <div
              ref={yearDropdownRef}
              className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto min-w-[80px]"
            >
              {years.map((year) => (
                <button
                  key={year}
                  data-year={year}
                  onClick={() => selectYear(year)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 whitespace-nowrap ${
                    year === currentYear ? "bg-blue-50 text-blue-600 font-medium" : ""
                  }`}
                >
                  {year}년
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 월 선택 */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowMonthDropdown(!showMonthDropdown)
              setShowYearDropdown(false)
            }}
            className="flex items-center gap-1"
          >
            {monthNames[currentMonth]}
            <ChevronDown className="w-3 h-3" />
          </Button>

          {showMonthDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10">
              <div className="grid grid-cols-4 gap-1 p-2 w-48">
                {monthNames.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => selectMonth(index)}
                    className={`px-2 py-1 text-xs rounded hover:bg-gray-100 text-center ${
                      index === currentMonth ? "bg-blue-50 text-blue-600 font-medium" : ""
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={nextMonth}>
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* 드롭다운 외부 클릭 시 닫기 */}
      {(showYearDropdown || showMonthDropdown) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowYearDropdown(false)
            setShowMonthDropdown(false)
          }}
        />
      )}
    </div>
  )
}
