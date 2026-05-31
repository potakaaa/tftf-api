import { useEffect, useMemo, useState } from "react"
import {
  RiArrowRightSLine,
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiCheckboxCircleFill,
  RiCloseCircleLine,
  RiCodeSSlashLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiLoader4Line,
  RiMap2Line,
  RiMapPin2Line,
  RiMoonClearLine,
  RiPulseLine,
  RiRestartLine,
  RiRouteLine,
  RiSparklingLine,
  RiSunLine,
  RiTerminalBoxLine,
  RiTimeLine,
} from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"

export const Route = createFileRoute("/")({ component: App })

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

const defaultRequest = {
  fromLat: "8.50881",
  fromLong: "124.64827",
  fromName: "Bonbon",
  toLat: "8.51133",
  toLong: "124.62429",
  toName: "Westbound Bulua Terminal",
  transMeter: "100.5",
  hour: "10",
}

type RequestValues = typeof defaultRequest
type HealthState = "idle" | "loading" | "online" | "offline"
type Theme = "light" | "dark"
type RouteLeg = {
  "Route ID": number
  "Route Name": string
  "Transfer Cost": number
  "Entry Coordinate": [number, number]
  "Exit Coordinate": [number, number]
}
type RouteResponse = {
  From: { Lattitude: number; Longitude: number; "Origin Name": string }
  Routes: RouteLeg[]
  To: { Lattitude: number; Longitude: number; "Destination Name": string }
  "Transfer Range": number
}

function validateRequest(request: RequestValues) {
  const numericFields = [
    ["origin latitude", request.fromLat],
    ["origin longitude", request.fromLong],
    ["destination latitude", request.toLat],
    ["destination longitude", request.toLong],
    ["transfer range", request.transMeter],
    ["departure hour", request.hour],
  ]

  if (!request.fromName.trim() || !request.toName.trim()) {
    return "Add a name for both the origin and destination."
  }

  const invalidField = numericFields.find(([, value]) => {
    return !value.trim() || !Number.isFinite(Number(value))
  })
  if (invalidField) {
    return `Enter a valid number for the ${invalidField[0]}.`
  }

  if (Number(request.transMeter) <= 0) {
    return "Transfer range must be greater than zero meters."
  }

  if (
    !Number.isInteger(Number(request.hour)) ||
    Number(request.hour) < 0 ||
    Number(request.hour) > 23
  ) {
    return "Departure hour must be a whole number from 0 to 23."
  }

  return null
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const savedTheme = window.localStorage.getItem("tftf-theme")
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function App() {
  const [request, setRequest] = useState(defaultRequest)
  const [health, setHealth] = useState<HealthState>("idle")
  const [response, setResponse] = useState<RouteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  const routeUrl = useMemo(() => {
    const query = new URLSearchParams(request)
    return `${apiBaseUrl}/api/routes?${query.toString()}`
  }, [request])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    window.localStorage.setItem("tftf-theme", theme)
  }, [theme])

  function updateRequest(field: keyof RequestValues, value: string) {
    setRequest((current) => ({ ...current, [field]: value }))
  }

  async function checkHealth() {
    setHealth("loading")
    try {
      const result = await fetch(`${apiBaseUrl}/health`)
      if (!result.ok) throw new Error("Health check failed")
      setHealth("online")
    } catch {
      setHealth("offline")
    }
  }

  async function runRouteRequest() {
    const validationError = validateRequest(request)
    if (validationError) {
      setResponse(null)
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const result = await fetch(routeUrl)
      const payload = (await result.json()) as
        | RouteResponse
        | { detail?: string }
      if (!result.ok) {
        throw new Error("detail" in payload ? payload.detail : "Request failed")
      }
      setResponse(payload as RouteResponse)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reach the API"
      )
    } finally {
      setIsLoading(false)
    }
  }

  function resetRequest() {
    setRequest(defaultRequest)
    setResponse(null)
    setError(null)
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[36rem] bg-[radial-gradient(circle_at_18%_12%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent_26%),radial-gradient(circle_at_78%_0%,color-mix(in_oklch,var(--primary)_13%,transparent),transparent_25%)] dark:opacity-70" />

      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-foreground text-primary shadow-sm">
              <RiRouteLine className="size-5" />
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
              href={`${apiBaseUrl}/docs`}
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
              onClick={() =>
                setTheme((current) => (current === "light" ? "dark" : "light"))
              }
            >
              {theme === "light" ? <RiMoonClearLine /> : <RiSunLine />}
            </Button>
          </div>
        </div>
      </header>

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
            transfer range, and raw API response in one place.
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
            error={error}
            isLoading={isLoading}
            response={response}
            routeUrl={routeUrl}
          />
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-muted-foreground lg:px-8">
          <span>Native TFTF graph runner · FastAPI service</span>
          <a
            href={`${apiBaseUrl}/docs`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-semibold transition-colors hover:text-foreground sm:hidden"
          >
            Open API docs <RiArrowRightUpLine className="size-3.5" />
          </a>
        </div>
      </footer>
    </main>
  )
}

function HealthBadge({ health }: { health: HealthState }) {
  if (health === "idle" || health === "loading") return null

  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold ${
        health === "online"
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          health === "online" ? "bg-primary" : "bg-destructive"
        }`}
      />
      API {health}
    </span>
  )
}

function RequestForm({
  isLoading,
  request,
  resetRequest,
  runRouteRequest,
  updateRequest,
}: {
  isLoading: boolean
  request: RequestValues
  resetRequest: () => void
  runRouteRequest: () => void
  updateRequest: (field: keyof RequestValues, value: string) => void
}) {
  return (
    <form
      className="overflow-hidden rounded-3xl border border-border bg-card/90 shadow-sm backdrop-blur"
      onSubmit={(event) => {
        event.preventDefault()
        runRouteRequest()
      }}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <RiMap2Line className="size-4 text-primary-foreground dark:text-primary" />
            <h2 className="text-sm font-bold">Route parameters</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Update the sample values before sending your request.
          </p>
        </div>
        <span className="hidden rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] font-semibold text-muted-foreground sm:block">
          GET
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="relative grid gap-5 sm:grid-cols-2 sm:gap-6">
          <div className="absolute top-6 bottom-6 left-[0.42rem] hidden w-px bg-border sm:block" />
          <LocationGroup
            label="Origin"
            hint="Where the trip begins"
            tone="primary"
            name={request.fromName}
            latitude={request.fromLat}
            longitude={request.fromLong}
            onNameChange={(value) => updateRequest("fromName", value)}
            onLatitudeChange={(value) => updateRequest("fromLat", value)}
            onLongitudeChange={(value) => updateRequest("fromLong", value)}
          />
          <LocationGroup
            label="Destination"
            hint="Where the passenger gets off"
            tone="foreground"
            name={request.toName}
            latitude={request.toLat}
            longitude={request.toLong}
            onNameChange={(value) => updateRequest("toName", value)}
            onLatitudeChange={(value) => updateRequest("toLat", value)}
            onLongitudeChange={(value) => updateRequest("toLong", value)}
          />
        </div>

        <div className="my-6 border-t border-border" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Transfer range"
            value={request.transMeter}
            suffix="meters"
            icon={<RiRouteLine />}
            inputMode="decimal"
            type="number"
            min="0.1"
            step="0.1"
            onChange={(value) => updateRequest("transMeter", value)}
          />
          <Field
            label="Departure hour"
            value={request.hour}
            suffix="24-hour"
            icon={<RiTimeLine />}
            inputMode="numeric"
            type="number"
            min="0"
            max="23"
            step="1"
            onChange={(value) => updateRequest("hour", value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="max-w-sm text-xs leading-5 text-muted-foreground">
            Press Enter from any field to calculate with the current values.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-full px-4"
              onClick={resetRequest}
            >
              <RiRestartLine />
              Reset
            </Button>
            <Button
              type="submit"
              className="rounded-full px-4 font-bold shadow-sm shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <RiLoader4Line className="animate-spin" />
              ) : (
                <RiArrowRightSLine />
              )}
              {isLoading ? "Calculating..." : "Calculate route"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

function LocationGroup({
  label,
  hint,
  tone,
  name,
  latitude,
  longitude,
  onNameChange,
  onLatitudeChange,
  onLongitudeChange,
}: {
  label: string
  hint: string
  tone: "primary" | "foreground"
  name: string
  latitude: string
  longitude: string
  onNameChange: (value: string) => void
  onLatitudeChange: (value: string) => void
  onLongitudeChange: (value: string) => void
}) {
  return (
    <div className="relative sm:pl-6">
      <span
        className={`absolute top-2 left-0 hidden size-3.5 rounded-full border-2 border-card sm:block ${
          tone === "primary" ? "bg-primary" : "bg-foreground"
        }`}
      />
      <div className="mb-3">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="space-y-3">
        <Field
          label={`${label} name`}
          value={name}
          icon={<RiMapPin2Line />}
          onChange={onNameChange}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Latitude"
            value={latitude}
            inputMode="decimal"
            type="number"
            step="any"
            onChange={onLatitudeChange}
          />
          <Field
            label="Longitude"
            value={longitude}
            inputMode="decimal"
            type="number"
            step="any"
            onChange={onLongitudeChange}
          />
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  suffix,
  icon,
  inputMode,
  max,
  min,
  step,
  type = "text",
  onChange,
}: {
  label: string
  value: string
  suffix?: string
  icon?: React.ReactNode
  inputMode?: "decimal" | "numeric"
  max?: string
  min?: string
  step?: string
  type?: "text" | "number"
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 transition-colors focus-within:border-foreground/35 focus-within:bg-background">
        {icon && (
          <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
        )}
        <input
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          value={value}
          aria-label={label}
          inputMode={inputMode}
          max={max}
          min={min}
          required
          step={step}
          type={type}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
    </label>
  )
}

function ResponsePanel({
  error,
  isLoading,
  response,
  routeUrl,
}: {
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
          <ErrorState message={error} routeUrl={routeUrl} />
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
      </div>
      <CodeBlock value={`curl "${routeUrl}"`} />
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

function ErrorState({
  message,
  routeUrl,
}: {
  message: string
  routeUrl: string
}) {
  return (
    <div>
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
      </div>
      <CodeBlock value={`curl "${routeUrl}"`} />
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

function CodeBlock({
  className = "mt-6",
  value,
}: {
  className?: string
  value: string
}) {
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
    <div
      className={`${className} overflow-hidden rounded-xl border border-border bg-muted/45`}
    >
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
      <pre className="max-h-28 p-3 font-mono text-[11px] leading-5 break-all whitespace-pre-wrap text-muted-foreground">
        {value}
      </pre>
    </div>
  )
}
