import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DND_ID = {
  category: (id: string) => `category-${id}`,
  link: (id: string) => `link-${id}`,
}

export function parseDragId(id: string): { type: 'link' | 'category' | null; rawId: string } {
  if (id.startsWith('link-')) return { type: 'link', rawId: id.slice(5) }
  if (id.startsWith('category-')) return { type: 'category', rawId: id.slice(9) }
  return { type: null, rawId: id }
}

export const byOrder = (a: { order?: number }, b: { order?: number }) =>
  (a.order ?? 0) - (b.order ?? 0)
