import { SelectHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/libs/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-fit">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm',
            'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            className
          )}
          {...props}>
          {options.map((opt, index) => (
            <option key={`${opt.value}-${index}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
)
Select.displayName = 'Select'
