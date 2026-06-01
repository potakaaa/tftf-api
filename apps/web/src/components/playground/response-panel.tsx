import { useState } from "react"
import {
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiCloseCircleLine,
  RiCodeSSlashLine,
  RiFileCopyLine,
  RiLoader4Line,
  RiSparklingLine,
  RiTerminalBoxLine,
} from "@remixicon/react"

import type { RouteLeg, RouteResponse } from "./model"

export function ResponsePanel({
  apiBaseUrl,
  error,
  isLoading,
  response,
  routeUrl,
}: {
  apiBaseUrl: string
  error: string | null
  isLoading: boolean
  response: RouteResponse | null
  routeUrl: string
}) {
  return (
    <aside
      aria-live="polite"
      className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_70px_-32px_rgba(0,0,0,0.4)] xl:sticky xl:top-24"
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary-foreground dark:text-primary">
            <RiCodeSSlashLine className="size-4" />
          </span>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] uppercase">
              Live response
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Native route calculation output
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10px] font-semibold text-muted-foreground">
          GET /api/routes
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            apiBaseUrl={apiBaseUrl}
            message={error}
            routeUrl={routeUrl}
          />
        ) : response ? (
          <ResponseState response={response} routeUrl={routeUrl} />
        ) : (
          <EmptyState routeUrl={routeUrl} />
        )}
      </div>
    </aside>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary-foreground dark:text-primary">
        <RiLoader4Line className="size-6 animate-spin" />
      </div>
      <p className="mt-5 font-bold">Calculating your route</p>
      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
        Sending the request to the graph runner and waiting for the best route.
      </p>
    </div>
  )
}

function EmptyState({ routeUrl }: { routeUrl: string }) {
  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary-foreground dark:text-primary">
        <RiSparklingLine className="size-6" />
      </div>
      <p className="mt-6 text-xl font-bold tracking-tight">
        Ready to calculate a route
      </p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Tune the route parameters, then run the sample request. The response
        will appear here with a leg-by-leg breakdown.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        <MiniStep number="01" label="Set points" />
        <MiniStep number="02" label="Run request" />
        <MiniStep number="03" label="Inspect route" />
      </div>
      <RequestPreview value={`curl "${routeUrl}"`} />
    </div>
  )
}

function ErrorState({
  apiBaseUrl,
  message,
  routeUrl,
}: {
  apiBaseUrl: string
  message: string
  routeUrl: string
}) {
  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <RiCloseCircleLine className="size-6" />
      </div>
      <p className="mt-6 text-xl font-bold tracking-tight">Request failed</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {message}
      </p>
      <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs leading-5 text-muted-foreground">
        Review the route parameters. If they look right, make sure the FastAPI
        service is running at{" "}
        <code className="font-mono text-foreground">{apiBaseUrl}</code>.
      </div>
      <RequestPreview value={`curl "${routeUrl}"`} />
    </div>
  )
}

function ResponseState({
  response,
  routeUrl,
}: {
  response: RouteResponse
  routeUrl: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary-foreground dark:text-primary">
        <RiCheckboxCircleFill className="size-5" />
        <span className="text-xs font-bold tracking-[0.16em] uppercase">
          Route calculated
        </span>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-muted/35 p-4">
        <span className="size-2.5 shrink-0 rounded-full bg-primary" />
        <p className="min-w-0 flex-1 truncate text-sm font-bold">
          {response.From["Origin Name"]}
        </p>
        <RiArrowRightLine className="size-4 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 truncate text-right text-sm font-bold">
          {response.To["Destination Name"]}
        </p>
        <span className="size-2.5 shrink-0 rounded-full bg-foreground" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Route legs" value={`${response.Routes.length}`} />
        <Stat
          label="Transfer range"
          value={`${response["Transfer Range"]} m`}
        />
      </div>
      <div className="my-6 border-y border-border py-5">
        <p className="mb-4 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
          Journey breakdown
        </p>
        <div className="space-y-1">
          {response.Routes.map((route, index) => (
            <RouteItem
              key={`${route["Route ID"]}-${route["Route Name"]}`}
              route={route}
              isLast={index === response.Routes.length - 1}
            />
          ))}
        </div>
      </div>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg py-1 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground">
          Inspect raw JSON
          <RiArrowRightLine className="size-4 transition-transform group-open:rotate-90" />
        </summary>
        <pre className="mt-3 max-h-56 overflow-auto rounded-xl bg-muted p-3 font-mono text-[11px] leading-5 text-muted-foreground">
          {JSON.stringify(response, null, 2)}
        </pre>
      </details>
      <p className="mt-5 font-mono text-[10px] leading-4 break-all text-muted-foreground">
        {routeUrl}
      </p>
    </div>
  )
}

function RouteItem({ route, isLast }: { route: RouteLeg; isLast: boolean }) {
  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast && (
        <span className="absolute top-4 bottom-0 left-[0.3rem] w-px bg-border" />
      )}
      <span className="relative mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-card bg-primary" />
      <div>
        <p className="text-sm font-bold">{route["Route Name"]}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Route #{route["Route ID"]} · Entry{" "}
          {route["Entry Coordinate"].join(", ")}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">
          Exit {route["Exit Coordinate"].join(", ")} · Transfer cost{" "}
          {route["Transfer Cost"]}
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/45 p-4">
      <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-bold tracking-tight">{value}</p>
    </div>
  )
}

function MiniStep({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/35 p-3">
      <p className="font-mono text-[10px] font-bold text-primary-foreground dark:text-primary">
        {number}
      </p>
      <p className="mt-1 text-xs font-semibold">{label}</p>
    </div>
  )
}

function RequestPreview({ value }: { value: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle"
  )

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(value)
      setCopyState("copied")
    } catch {
      setCopyState("error")
    }
    window.setTimeout(() => setCopyState("idle"), 1600)
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border bg-muted/45">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          <RiTerminalBoxLine className="size-3.5" />
          Request preview
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          onClick={copyRequest}
        >
          <RiFileCopyLine className="size-3.5" />
          {copyState === "copied"
            ? "Copied"
            : copyState === "error"
              ? "Copy failed"
              : "Copy curl"}
        </button>
      </div>
      <pre className="max-h-28 overflow-auto p-4 font-mono text-xs leading-6 break-all whitespace-pre-wrap text-muted-foreground">
        {value}
      </pre>
    </div>
  )
}
