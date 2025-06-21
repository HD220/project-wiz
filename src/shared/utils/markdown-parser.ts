import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { Schema } from 'hast-util-sanitize'

const defaultSchema: Schema = {
  ...rehypeSanitize.defaultSchema,
  attributes: {
    ...rehypeSanitize.defaultSchema.attributes,
    code: [...(rehypeSanitize.defaultSchema.attributes?.code || []), 'className']
  }
}

export async function parseMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, defaultSchema)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(markdown)

  return String(file)
}