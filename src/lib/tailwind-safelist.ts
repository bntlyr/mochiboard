// This file is used to ensure that all mochi color classes are included in the build
// It's not actually imported anywhere, but Tailwind will scan it and include the classes

// Background colors
export const bgMochiColors = [
    "bg-mochi-50",
    "bg-mochi-100",
    "bg-mochi-200",
    "bg-mochi-300",
    "bg-mochi-400",
    "bg-mochi-500",
    "bg-mochi-600",
    "bg-mochi-700",
    "bg-mochi-800",
    "bg-mochi-900",
    "hover:bg-mochi-50",
    "hover:bg-mochi-100",
    "hover:bg-mochi-200",
    "hover:bg-mochi-300",
    "hover:bg-mochi-400",
    "hover:bg-mochi-500",
    "hover:bg-mochi-600",
    "hover:bg-mochi-700",
    "hover:bg-mochi-800",
    "hover:bg-mochi-900",
  ]
  
  // Text colors
  export const textMochiColors = [
    "text-mochi-50",
    "text-mochi-100",
    "text-mochi-200",
    "text-mochi-300",
    "text-mochi-400",
    "text-mochi-500",
    "text-mochi-600",
    "text-mochi-700",
    "text-mochi-800",
    "text-mochi-900",
    "hover:text-mochi-50",
    "hover:text-mochi-100",
    "hover:text-mochi-200",
    "hover:text-mochi-300",
    "hover:text-mochi-400",
    "hover:text-mochi-500",
    "hover:text-mochi-600",
    "hover:text-mochi-700",
    "hover:text-mochi-800",
    "hover:text-mochi-900",
  ]
  
  // Border colors
  export const borderMochiColors = [
    "border-mochi-50",
    "border-mochi-100",
    "border-mochi-200",
    "border-mochi-300",
    "border-mochi-400",
    "border-mochi-500",
    "border-mochi-600",
    "border-mochi-700",
    "border-mochi-800",
    "border-mochi-900",
    "hover:border-mochi-50",
    "hover:border-mochi-100",
    "hover:border-mochi-200",
    "hover:border-mochi-300",
    "hover:border-mochi-400",
    "hover:border-mochi-500",
    "hover:border-mochi-600",
    "hover:border-mochi-700",
    "hover:border-mochi-800",
    "hover:border-mochi-900",
  ]
  
  // This ensures that all the classes are "used" in the codebase
  export const allMochiColors = [...bgMochiColors, ...textMochiColors, ...borderMochiColors]
  
  