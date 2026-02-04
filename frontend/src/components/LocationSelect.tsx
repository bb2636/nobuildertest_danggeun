import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { LocationItem } from '../api/locations'

interface LocationSelectProps {
  value: string
  onChange: (code: string, name: string) => void
  options: LocationItem[]
  placeholder?: string
  id?: string
  label?: string
  disabled?: boolean
  className?: string
  /** 드롭다운 리스트 최대 높이 (컴팩트 유지) */
  listMaxHeight?: string
}

export default function LocationSelect({
  value,
  onChange,
  options,
  placeholder = '동네를 선택하세요',
  id = 'location',
  label,
  disabled,
  className = '',
  listMaxHeight = '200px',
}: LocationSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((l) => l.code === value)
  const displayText = selected?.name ?? placeholder

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-body-14 font-medium text-gray-100 mb-1.5">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-12 px-4 rounded-lg border border-gray-20 text-body-16 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-point-0 focus:border-transparent bg-white flex items-center justify-between text-left disabled:opacity-60"
      >
        <span className={value ? 'text-gray-100' : 'text-gray-40'}>{displayText}</span>
        <ChevronDown className={`w-5 h-5 text-gray-50 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          className="absolute z-20 left-0 right-0 mt-1 py-1 bg-white border border-gray-20 rounded-lg shadow-lg overflow-y-auto"
          style={{ maxHeight: listMaxHeight }}
        >
          {options.map((loc) => (
            <li key={loc.code}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-body-14 text-gray-100 hover:bg-grey-50 focus:bg-grey-50 focus:outline-none"
                onClick={() => {
                  onChange(loc.code, loc.name)
                  setOpen(false)
                }}
              >
                {loc.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
