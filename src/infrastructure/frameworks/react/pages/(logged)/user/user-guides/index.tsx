import { MarkdownView } from "@/components/markdown-render";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/user/user-guides/")({
  component: Home,
});

export function Home() {
  return (
    <div className="m-4 pb-4">
      <MarkdownView className="h-full">{userguide}</MarkdownView>
    </div>
  );
}

const userguide = `
# GFM

## Autolink literals

www.example.com, https://example.com, and contact@example.com.

## Footnote

A note[^1]

[^1]: Big note.

## Strikethrough

~one~ or ~~two~~ tildes.

## Table

| a | b  |  c |  d  |
| - | :- | -: | :-: |
| a | b  |  c |  d  |

## Tasklist

* [ ] to do
* [x] done
 
# GFM

## Autolink literals

www.example.com, https://example.com, and contact@example.com.

## Footnote

A note[^1]

[^1]: Big note.

## Strikethrough

~one~ or ~~two~~ tildes.

## Table

| a | b  |  c |  d  |
| - | :- | -: | :-: |
| a | b  |  c |  d  |

## Tasklist

* [ ] to do
* [x] done
`;
