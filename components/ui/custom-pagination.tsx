"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface CustomPaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

export function CustomPagination({
  totalPages,
  currentPage,
  onPageChange,
}: CustomPaginationProps) {
  const pageGroupSize = 5
  const currentGroup = Math.ceil(currentPage / pageGroupSize)
  const startPage = (currentGroup - 1) * pageGroupSize + 1
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages)

  const pageNumbers = []
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(
      <Button
        key={i}
        variant="outline"
        size="sm"
        className={`px-3 ${currentPage === i ? "bg-blue-50 text-blue-600" : ""}`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </Button>
    )
  }

  return (
    <div className="flex gap-1 ml-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3"
      >
        이전
      </Button>
      {pageNumbers}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3"
      >
        다음
      </Button>
    </div>
  )
}
