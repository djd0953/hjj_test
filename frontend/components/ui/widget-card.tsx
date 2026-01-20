import * as React from 'react'
import { cn } from '@/libs/utils'

interface WidgetCardProps extends React.ComponentProps<'div'> {
  title: string
  children: React.ReactNode
}

export function WidgetCard({ title, children, className, ...props }: WidgetCardProps) {
  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-shadow duration-200 hover:shadow-xl',
        className
      )}
      {...props}>
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-auto p-4" onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
