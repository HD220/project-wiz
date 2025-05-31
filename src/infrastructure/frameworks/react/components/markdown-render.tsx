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
          h1: ({ node, ...props }) => <H1 {...props} />,
          h2: ({ node, ...props }) => <H2 {...props} />,
          h3: ({ node, ...props }) => <H3 {...props} />,
          h4: ({ node, ...props }) => <H4 {...props} />,
          p: ({ node, ...props }) => <P {...props} />,
          blockquote: ({ node, ...props }) => <Blockquote {...props} />,
          table: ({ node, ...props }) => (
            <TableContainer>
              <Table {...props} />
            </TableContainer>
          ),
          thead: ({ node, ...props }) => <THead {...props} />,
          tbody: ({ node, ...props }) => <TBody {...props} />,
          tr: ({ node, ...props }) => <Tr {...props} />,
          th: ({ node, ...props }) => <Th {...props} />,
          td: ({ node, ...props }) => <Td {...props} />,
          ul: ({ node, ...props }) => <Ul {...props} />,
          li: ({ node, ...props }) => <Li {...props} />,
          code: ({ node, ...props }) => <Code {...props} />,
          a: ({ node, ...props }) => (
            <Button variant={"link"} asChild>
              <a target="_blank" {...props} />
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
