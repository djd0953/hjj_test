'use client'

import { ReactNode, useState } from 'react'

import { cn } from '@/libs/utils'

interface CollapseProps {
  title: ReactNode
  defaultOpen?: boolean
  children: ReactNode
  className?: string
  headerClassName?: string
}

export const Collapse = ({
  title,
  defaultOpen = false,
  children,
  className,
  headerClassName,
}: CollapseProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('border rounded', className)}>
      <div
        className={cn(
          'flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50',
          headerClassName
        )}
        onClick={() => setIsOpen(!isOpen)}>
        <span className="text-gray-500 text-sm">{isOpen ? '▼' : '▶'}</span>
        <div className="flex-1">{title}</div>
      </div>

      {isOpen && <div className="p-3 border-t bg-gray-50">{children}</div>}
    </div>
  )
}

export default Collapse
