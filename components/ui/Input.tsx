// components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { error?: boolean }
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('input-field', error && 'border-red-500 focus:ring-red-500', className)}
      {...props}
    />
  )
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { error?: boolean }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn('input-field min-h-[100px] resize-y', error && 'border-red-500', className)}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

export function Field({
  label, error, hint, children, required,
}: {
  label?: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="mb-3">
      {label && (
        <label className="input-label">
          {label} {required && <span className="text-orange">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-white/45 mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red mt-1">{error}</p>}
    </div>
  )
}
