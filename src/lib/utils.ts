import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Update the linkifyText function to preserve newlines
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

  // If no URLs found, return the original text with newlines preserved
  if (matches.length === 0) {
    // Split by newlines and create an array of text and <br /> elements
    return text.split("\n").reduce((result: React.ReactNode[], line, i, arr) => {
      if (i < arr.length - 1) {
        return [...result, line, React.createElement("br", { key: `br-${i}` })]
      }
      return [...result, line]
    }, [])
  }

  // Split the text by URLs and create React nodes
  const result: React.ReactNode[] = []
  let lastIndex = 0

  matches.forEach((url) => {
    const index = text.indexOf(url, lastIndex)

    // Add text before the URL (with newlines preserved)
    if (index > lastIndex) {
      const textBefore = text.substring(lastIndex, index)
      const textWithBreaks = textBefore.split("\n").reduce((acc: React.ReactNode[], line, i, arr) => {
        if (i < arr.length - 1) {
          return [...acc, line, React.createElement("br", { key: `br-before-${i}-${index}` })]
        }
        return [...acc, line]
      }, [])
      result.push(...textWithBreaks)
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

  // Add any remaining text (with newlines preserved)
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex)
    const textWithBreaks = textAfter.split("\n").reduce((acc: React.ReactNode[], line, i, arr) => {
      if (i < arr.length - 1) {
        return [...acc, line, React.createElement("br", { key: `br-after-${i}-${lastIndex}` })]
      }
      return [...acc, line]
    }, [])
    result.push(...textWithBreaks)
  }

  return result
}

