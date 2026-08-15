import { type ReactNode } from 'react'

type StepContainerProps = {
  children: ReactNode
  className?: string
}

export function StepContainer({ children, className = '' }: StepContainerProps) {
  return (
    <div className={`mx-auto flex min-h-full w-full max-w-[480px] flex-col px-5 ${className}`}>
      {children}
    </div>
  )
}
