import { Blockquote } from "@/components/typography/blockquote";
import { Code } from "@/components/typography/code";
import { H1, H2, H3, H4 } from "@/components/typography/titles";
import { Li, Ul } from "@/components/typography/list";
import { P } from "@/components/typography/paragraph";
import {
  Table,
  TableContainer,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/typography/table";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({
  children,
  ...props
}: React.ComponentProps<"div"> & { children?: string | null }) {
  return (
    <div {...props}>
      <Markdown
        components={{
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          h1: ({ node, ...props }) => <H1 {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          h2: ({ node, ...props }) => <H2 {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          h3: ({ node, ...props }) => <H3 {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          h4: ({ node, ...props }) => <H4 {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          p: ({ node, ...props }) => <P {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          blockquote: ({ node, ...props }) => <Blockquote {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          table: ({ node, ...props }) => (
            <TableContainer>
              <Table {...props} />
            </TableContainer>
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          thead: ({ node, ...props }) => <THead {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          tbody: ({ node, ...props }) => <TBody {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          tr: ({ node, ...props }) => <Tr {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          th: ({ node, ...props }) => <Th {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          td: ({ node, ...props }) => <Td {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ul: ({ node, ...props }) => <Ul {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          li: ({ node, ...props }) => <Li {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          code: ({ node, ...props }) => <Code {...props} />,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          a: ({ node, ...props }) => (
            <Button variant={"link"} asChild>
              <a target="_blank" rel="noopener noreferrer" {...props} />
            </Button>
          ),
        }}
        rehypePlugins={[[remarkGfm, {}]]}
      >
        {children}
      </Markdown>
    </div>
  );
}
