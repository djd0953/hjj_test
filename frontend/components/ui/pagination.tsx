import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { cn } from '@/libs/utils'
import { Button } from '@/components/ui/button'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount?: number
  onPageChange: (page: number) => void
  className?: string
  showPageInfo?: boolean
  showFirstLast?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  className,
  showPageInfo = true,
  showFirstLast = false,
}: PaginationProps) {
  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages

  const handleFirstPage = () => onPageChange(1)
  const handlePreviousPage = () => onPageChange(Math.max(1, currentPage - 1))
  const handleNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))
  const handleLastPage = () => onPageChange(Math.max(1, totalPages))

  return (
    <div className={cn('flex items-center justify-end space-x-2 py-4', className)}>
      {showPageInfo && (
        <div className="text-muted-foreground flex-1 text-sm">
          {totalCount !== undefined && <>총 {totalCount}개 </>}
          (페이지 {currentPage} / {totalPages || 1})
        </div>
      )}
      <div className="flex space-x-1">
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirstPage}
            disabled={!canPreviousPage}
            aria-label="첫 페이지">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={!canPreviousPage}
          aria-label="이전 페이지">
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1">이전</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!canNextPage}
          aria-label="다음 페이지">
          <span className="mr-1">다음</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLastPage}
            disabled={!canNextPage}
            aria-label="마지막 페이지">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
