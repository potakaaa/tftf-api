import { useState } from "react"
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter"

import { cn } from "@workspace/ui/lib/utils"

type CodeTab = {
  code: string
  language?: string
  name: string
}

type CodeBlockProps = {
  className?: string
  code?: string
  filename: string
  language: string
  tabs?: CodeTab[]
}

const codeTheme = {
  'code[class*="language-"]': {
    color: "#f5f1eb",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  comment: { color: "#8f857b" },
  keyword: { color: "#ffba6b" },
  number: { color: "#8bd5ca" },
  operator: { color: "#c6a0f6" },
  punctuation: { color: "#b8b0a8" },
  string: { color: "#a6da95" },
  function: { color: "#91d7e3" },
  boolean: { color: "#f5a97f" },
  property: { color: "#eed49f" },
  tag: { color: "#ed8796" },
  attrName: { color: "#eed49f" },
  attrValue: { color: "#a6da95" },
}

function CodeBlock({
  className,
  code,
  filename,
  language,
  tabs,
}: CodeBlockProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const activeTab = tabs?.[activeTabIndex]
  const activeCode = activeTab?.code ?? code ?? ""
  const activeLanguage = activeTab?.language ?? language

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(activeCode)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 1600)
    } catch {
      setIsCopied(false)
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-[#181614] text-[#f5f1eb] shadow-[0_24px_80px_-40px_rgba(0,0,0,0.68)]",
        className
      )}
    >
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="hidden gap-1.5 sm:flex">
            <span className="size-2.5 rounded-full bg-[#ff6b5f]" />
            <span className="size-2.5 rounded-full bg-[#f4bd4f]" />
            <span className="size-2.5 rounded-full bg-[#62c454]" />
          </div>
          <span className="truncate font-mono text-[11px] text-white/55">
            {activeTab?.name ?? filename}
          </span>
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white/55 uppercase transition-colors hover:bg-white/8 hover:text-white"
          onClick={copyCode}
        >
          {isCopied ? (
            <RiCheckLine className="size-3.5 text-primary" />
          ) : (
            <RiFileCopyLine className="size-3.5" />
          )}
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>

      {tabs && tabs.length > 1 && (
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 bg-black/10 p-2">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              type="button"
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 font-mono text-[11px] transition-colors",
                activeTabIndex === index
                  ? "bg-primary text-primary-foreground"
                  : "text-white/50 hover:bg-white/8 hover:text-white/85"
              )}
              onClick={() => setActiveTabIndex(index)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-[30rem] overflow-auto text-xs">
        <SyntaxHighlighter
          customStyle={{
            background: "transparent",
            fontSize: "0.75rem",
            lineHeight: "1.6rem",
            margin: 0,
            padding: "1rem",
          }}
          language={activeLanguage}
          lineNumberStyle={{
            color: "rgba(255,255,255,0.22)",
            minWidth: "2.4em",
          }}
          showLineNumbers
          style={codeTheme}
          wrapLongLines
        >
          {activeCode}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export { CodeBlock }
export type { CodeTab }
