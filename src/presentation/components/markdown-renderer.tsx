import React, { useEffect, useState } from 'react'
import { parseMarkdown } from '@/shared/utils/markdown-parser'
import { useTheme } from '@/infrastructure/frameworks/react/hooks/use-theme'
import 'highlight.js/styles/github.css'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const [html, setHtml] = useState('')

  useEffect(() => {
    parseMarkdown(content).then(setHtml)
  }, [content])

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      data-theme={theme}
    />
  )
}