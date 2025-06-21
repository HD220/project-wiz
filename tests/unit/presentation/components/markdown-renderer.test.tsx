import { render, screen } from '@testing-library/react'
import { MarkdownRenderer } from '@/presentation/components/markdown-renderer'

describe('MarkdownRenderer', () => {
  it('should render plain text correctly', async () => {
    render(<MarkdownRenderer content="Hello world" />)
    expect(await screen.findByText('Hello world')).toBeInTheDocument()
  })

  it('should render markdown headings', async () => {
    render(<MarkdownRenderer content="# Heading 1" />)
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Heading 1')
  })

  it('should render code blocks with syntax highlighting', async () => {
    render(<MarkdownRenderer content="```js\nconst x = 1\n```" />)
    expect(await screen.findByText('const x = 1')).toBeInTheDocument()
    expect(screen.getByText('const x = 1').closest('pre')).toHaveClass('hljs')
  })

  it('should sanitize dangerous HTML', async () => {
    const dangerousContent = '<script>alert("xss")</script>'
    render(<MarkdownRenderer content={dangerousContent} />)
    expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument()
  })
})