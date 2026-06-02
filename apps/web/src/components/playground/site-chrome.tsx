import {
  RiArrowRightUpLine,
  RiExternalLinkLine,
  RiMoonClearLine,
  RiSunLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"

import type { Theme } from "./model"

export function SiteHeader({
  apiDocsUrl,
  theme,
  toggleTheme,
}: {
  apiDocsUrl: string
  theme: Theme
  toggleTheme: () => void
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
            <img
              src="/icon.png"
              alt=""
              className="size-full scale-x-[1.12] scale-y-[1.04]"
              aria-hidden="true"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold tracking-tight">TFTF Edge</p>
              <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary-foreground uppercase dark:text-primary">
                beta
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Route API playground
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={apiDocsUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
          >
            API docs
            <RiExternalLinkLine className="size-3.5" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="rounded-full"
            onClick={toggleTheme}
          >
            {theme === "light" ? <RiMoonClearLine /> : <RiSunLine />}
          </Button>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter({ apiDocsUrl }: { apiDocsUrl: string }) {
  return (
    <footer className="relative z-10 border-t border-border/70">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-muted-foreground lg:px-8">
        <span>Native TFTF graph runner · FastAPI service</span>
        <a
          href={apiDocsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 font-semibold transition-colors hover:text-foreground sm:hidden"
        >
          Open API docs <RiArrowRightUpLine className="size-3.5" />
        </a>
      </div>
    </footer>
  )
}
