// src/components/ui/modal.tsx
import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/libs/utils'
import { buttonVariants } from '@/components/ui/button'
import { X } from 'lucide-react'

const modalOverlayVariants = cva(
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50',
  {
    variants: {
      variant: {
        primary: 'bg-black/50',
        secondary: 'bg-slate-900/40',
        tertiary: 'bg-gray-500/30',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

const modalContentVariants = cva(
  'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200',
  {
    variants: {
      size: {
        xs: 'w-full max-w-xs',
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
      },
      variant: {
        primary: 'border-border',
        secondary: 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900',
        tertiary: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
)

const modalStackVariants = cva(
  'bg-background fixed top-[50%] left-[50%] z-50 rounded-lg border shadow-lg pointer-events-none',
  {
    variants: {
      size: {
        xs: 'w-full max-w-xs',
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
      },
      variant: {
        primary: 'border-border',
        secondary: 'border-slate-300 dark:border-slate-700',
        tertiary: 'border-gray-200 dark:border-gray-700',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
)

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ModalVariant = 'primary' | 'secondary' | 'tertiary'
export type ModalType = 'alert' | 'confirm' | 'custom'

// 모달의 스타일/동작 관련 공통 Props (Store와 Hook 모두에서 사용)
export interface ModalContentProps {
  type?: ModalType
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  size?: ModalSize
  variant?: ModalVariant
  className?: string
  stackCount?: number
  showCloseButton?: boolean // X 버튼 표시 여부
}

// useModal 훅과 함께 사용할 때의 전체 Props
export interface ModalProps extends ModalContentProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
}

// Store에서 전달할 Payload 타입 (open/onOpenChange 제외)
export type ModalPayloadProps = ModalContentProps

function ModalLayout({
  open,
  onOpenChange,
  type = 'confirm',
  title,
  description,
  children,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  size = 'md',
  variant = 'primary',
  className,
  stackCount = 1,
  showCloseButton = true,
}: ModalProps) {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const handleClose = () => {
    onOpenChange?.(false)
  }

  const visibleStackCount = Math.min(stackCount - 1, 3)
  const showCancelButton = type === 'confirm'
  const isCustom = type === 'custom'

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={cn(modalOverlayVariants({ variant }))} />

        {/* 스택 인디케이터 */}
        {!isCustom &&
          Array.from({ length: visibleStackCount }).map((_, index) => {
            const reverseIndex = visibleStackCount - index
            return (
              <div
                key={`stack-${index}`}
                className={cn(modalStackVariants({ size, variant }), 'opacity-60')}
                style={{
                  transform: `translate(-50%, -50%) translateY(${-reverseIndex * 8}px) scale(${1 - reverseIndex * 0.03})`,
                  filter: `brightness(${1 - reverseIndex * 0.1})`,
                  height: '120px',
                }}
              />
            )
          })}

        {/* 메인 모달 */}
        <AlertDialogPrimitive.Content
          className={cn(modalContentVariants({ size, variant }), className)}>
          {/* X 닫기 버튼 */}
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">닫기</span>
            </button>
          )}

          {/* 스택 카운터 뱃지 */}
          {stackCount > 1 && (
            <div className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-medium shadow-md">
              {stackCount}
            </div>
          )}

          {title && (
            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
            </ModalHeader>
          )}

          {description && <ModalDescription>{description}</ModalDescription>}

          {children}

          {!isCustom && (
            <ModalFooter>
              {showCancelButton && (
                <AlertDialogPrimitive.Cancel
                  className={cn(buttonVariants({ variant: 'outline' }))}
                  onClick={handleCancel}>
                  {cancelText}
                </AlertDialogPrimitive.Cancel>
              )}
              <AlertDialogPrimitive.Action className={cn(buttonVariants())} onClick={handleConfirm}>
                {confirmText}
              </AlertDialogPrimitive.Action>
            </ModalFooter>
          )}
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}

function ModalHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />
  )
}

function ModalFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function ModalTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />
  )
}

function ModalDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  ModalLayout,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  modalContentVariants,
  modalOverlayVariants,
}
