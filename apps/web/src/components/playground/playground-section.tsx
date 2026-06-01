import { RiLoader4Line, RiPulseLine, RiTerminalBoxLine } from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"

import type { HealthState, RequestValues, RouteResponse } from "./model"
import { RequestForm } from "./request-form"
import { ResponsePanel } from "./response-panel"

export function PlaygroundSection({
  apiBaseUrl,
  checkHealth,
  error,
  health,
  isLoading,
  request,
  resetRequest,
  response,
  routeUrl,
  runRouteRequest,
  updateRequest,
}: {
  apiBaseUrl: string
  checkHealth: () => void
  error: string | null
  health: HealthState
  isLoading: boolean
  request: RequestValues
  resetRequest: () => void
  response: RouteResponse | null
  routeUrl: string
  runRouteRequest: () => void
  updateRequest: (field: keyof RequestValues, value: string) => void
}) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Cagayan de Oro route service
        </div>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-6xl">
          Find the right route,{" "}
          <span className="text-muted-foreground">edge to edge.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Compose a live request and inspect the calculated jeepney route,
          transfer range, and raw API response in one place. The bundled graph
          currently covers Cagayan de Oro, and the same API shape can support
          other compatible datasets that follow the same format.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            className="h-11 rounded-full px-5 font-bold shadow-sm shadow-primary/20"
            onClick={runRouteRequest}
            disabled={isLoading}
          >
            {isLoading ? (
              <RiLoader4Line className="animate-spin" />
            ) : (
              <RiTerminalBoxLine />
            )}
            {isLoading ? "Calculating route..." : "Calculate route"}
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-full bg-card/60 px-5 shadow-none"
            onClick={checkHealth}
            disabled={health === "loading"}
          >
            {health === "loading" ? (
              <RiLoader4Line className="animate-spin" />
            ) : (
              <RiPulseLine />
            )}
            Check API status
          </Button>
          <HealthBadge health={health} />
        </div>
      </div>
      <div className="mt-10 grid items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(25rem,0.92fr)] xl:gap-8">
        <RequestForm
          isLoading={isLoading}
          request={request}
          resetRequest={resetRequest}
          runRouteRequest={runRouteRequest}
          updateRequest={updateRequest}
        />
        <ResponsePanel
          apiBaseUrl={apiBaseUrl}
          error={error}
          isLoading={isLoading}
          response={response}
          routeUrl={routeUrl}
        />
      </div>
    </section>
  )
}

function HealthBadge({ health }: { health: HealthState }) {
  if (health === "idle" || health === "loading") return null
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold ${health === "online" ? "border-primary/40 bg-primary/10 text-foreground" : "border-destructive/30 bg-destructive/10 text-destructive"}`}
    >
      <span
        className={`size-1.5 rounded-full ${health === "online" ? "bg-primary" : "bg-destructive"}`}
      />
      API {health}
    </span>
  )
}
