import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to detect URLs in text and convert them to clickable links
export function linkifyText(text: string): React.ReactNode[] {
  if (!text) return [text]

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g

  // Find all matches
  const matches: string[] = []
  let match
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push(match[0])
  }

  // If no URLs found, return the original text
  if (matches.length === 0) {
    return [text]
  }

  // Split the text by URLs and create React nodes
  const result: React.ReactNode[] = []
  let lastIndex = 0

  matches.forEach((url) => {
    const index = text.indexOf(url, lastIndex)

    // Add text before the URL
    if (index > lastIndex) {
      result.push(text.substring(lastIndex, index))
    }

    // Add the URL as a link
    const href = url.startsWith("www.") ? `https://${url}` : url
    result.push(
      React.createElement(
        "a",
        {
          key: index,
          href: href,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-blue-500 hover:underline",
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
        url,
      ),
    )

    lastIndex = index + url.length
  })

  // Add any remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex))
  }

  return result
}

