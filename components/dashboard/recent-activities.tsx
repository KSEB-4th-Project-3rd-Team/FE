"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CustomPagination } from '@/components/ui/custom-pagination';
import { Building, DollarSign, ShoppingCart } from 'lucide-react';
import { InOutRecord } from '../utils';

interface RecentActivitiesProps {
  inOutData: InOutRecord[];
}

// Helper function to format numbers with commas
const formatNumber = (num: number) => num.toLocaleString();

const RecentActivities = React.memo(function RecentActivities({ inOutData }: RecentActivitiesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // 최근 활동 데이터 정렬 (날짜와 시간 기준)
  const sortedActivities = useMemo(() => {
    return [...inOutData].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeB.getTime() - dateTimeA.getTime();
    });
  }, [inOutData]);

  // 페이지네이션 적용
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedActivities.slice(startIndex, endIndex);
  }, [sortedActivities, currentPage]);

  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case '완료':
        return 'bg-green-100 text-green-800';
      case '진행 중':
        return 'bg-yellow-100 text-yellow-800';
      case '대기':
        return 'bg-blue-100 text-blue-800';
      case '취소':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 타입별 스타일
  const getTypeStyle = (type: string) => {
    return type.toLowerCase() === 'inbound' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            최근 입출고 활동
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              총 {sortedActivities.length}건
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              총 가치: ₩{formatNumber(
                sortedActivities.reduce((sum, record) => sum + (record.quantity * 1000), 0)
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {paginatedActivities.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜/시간</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>상품명</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>수량</TableHead>
                    <TableHead>회사</TableHead>
                    <TableHead>위치</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActivities.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono">
                        <div className="text-sm">
                          <div>{record.date}</div>
                          <div className="text-gray-500">{record.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeStyle(record.type)}`}>
                          {record.type === 'inbound' ? '입고' : '출고'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-[150px] truncate" title={record.productName}>
                          {record.productName}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.sku}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(record.quantity)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[120px] truncate" title={record.company}>
                          {record.company}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.location}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(record.status)}`}>
                          {record.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            최근 활동이 없습니다
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default RecentActivities;