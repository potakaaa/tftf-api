import { RiArrowRightLine, RiArrowRightUpLine } from "@remixicon/react"
import { CodeBlock } from "@workspace/ui/components/code-block"

import type { RequestValues } from "./model"

const requestFields = [
  ["fromLat", "Origin latitude"],
  ["fromLong", "Origin longitude"],
  ["fromName", "Origin label"],
  ["toLat", "Destination latitude"],
  ["toLong", "Destination longitude"],
  ["toName", "Destination label"],
  ["transMeter", "Transfer range in meters"],
  ["hour", "Departure hour from 0 to 23"],
] as const

const responseNotes = [
  'Top-level keys use legacy aliases such as "From" and "Transfer Range".',
  "Routes is an ordered list of route legs returned by the native runner.",
  "Each leg includes route metadata plus entry and exit coordinates.",
] as const

const sampleResponse = `{
  "From": {
    "Lattitude": 8.50881,
    "Longitude": 124.64827,
    "Origin Name": "Bonbon"
  },
  "Routes": [
    {
      "Route ID": 7,
      "Route Name": "R2 - Agora to Bulua",
      "Transfer Cost": 0,
      "Entry Coordinate": [8.50881, 124.64827],
      "Exit Coordinate": [8.51133, 124.62429]
    }
  ],
  "To": {
    "Lattitude": 8.51133,
    "Longitude": 124.62429,
    "Destination Name": "Westbound Bulua Terminal"
  },
  "Transfer Range": 100.5
}`

export function DatasetSection() {
  return (
    <section className="relative z-10 mt-8 overflow-hidden border-y border-foreground/10 bg-foreground text-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_18%_42%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] [background-image:radial-gradient(color-mix(in_oklch,var(--background)_38%,transparent)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_18%,transparent_76%)] [background-size:18px_18px] opacity-65" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:px-8 lg:py-28">
        <div>
          <SectionEyebrow number="01" label="Dataset compatibility" inverse />
          <h2 className="mt-7 max-w-4xl text-4xl font-bold tracking-[-0.06em] sm:text-5xl lg:text-7xl">
            One graph today.
            <span className="block text-background/72">
              A reusable format for the next city.
            </span>
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-8 text-background/80 sm:text-lg">
            TFTF Edge currently ships with the bundled Cagayan de Oro route
            graph. Other localities can use the same API shape when their route
            data follows the same dataset format.
          </p>
        </div>
        <div className="self-end border-l border-background/25 pl-6 sm:pl-8">
          <p className="font-mono text-xs font-bold tracking-[0.16em] text-primary uppercase">
            Current baseline
          </p>
          <p className="mt-4 text-3xl font-bold tracking-tight">
            Cagayan de Oro
          </p>
          <p className="mt-3 text-sm leading-7 text-background/78">
            Runtime locality switching is not exposed in the public API yet. The
            expansion path is deliberate: compatible datasets, stable contract.
          </p>
        </div>
      </div>
      <div className="relative border-t border-background/15">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-3">
          <BaselineFact
            number="01"
            title="Bundled now"
            detail="Cagayan de Oro graph packaged with the service."
          />
          <BaselineFact
            number="02"
            title="Compatible later"
            detail="Future datasets must match the current graph contract."
          />
          <BaselineFact
            number="03"
            title="Clear boundary"
            detail="No locality parameter or client-provided file path today."
          />
        </div>
      </div>
    </section>
  )
}

export function ApiGuideSection({ apiDocsUrl }: { apiDocsUrl: string }) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
        <div>
          <SectionEyebrow number="02" label="API guide" />
          <h2 className="mt-6 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
            A small contract,
            <span className="block text-muted-foreground">
              easy to inspect.
            </span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground">
            Start with health, inspect the generated docs, then send a route
            request. The playground above uses these same public entrypoints.
          </p>
          <a
            href={apiDocsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 text-sm font-bold transition-colors hover:text-muted-foreground"
          >
            Open interactive API docs <RiArrowRightUpLine className="size-4" />
          </a>
        </div>
        <div className="border-t border-border">
          <ApiRouteRow
            route="/health"
            note="Availability check for the FastAPI service."
          />
          <ApiRouteRow
            route="/docs"
            note="Interactive OpenAPI reference generated by FastAPI."
          />
          <ApiRouteRow
            route="/api/routes"
            note="Calculated route legs and transfer range."
          />
        </div>
      </div>
      <div className="mt-16 border-y border-border py-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(14rem,0.45fr)_minmax(0,1.55fr)]">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
              Required query parameters
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              Eight values describe the trip and transfer tolerance.
            </p>
          </div>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
            {requestFields.map(([field, detail]) => (
              <div key={field}>
                <p className="font-mono text-xs font-bold text-foreground">
                  {field}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ResponseShapeSection() {
  return (
    <section className="relative z-10 overflow-hidden border-y border-border bg-muted/35">
      <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-[radial-gradient(circle_at_80%_30%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent_48%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[minmax(0,0.82fr)_minmax(28rem,1.18fr)] lg:items-center lg:px-8 lg:py-28">
        <div>
          <SectionEyebrow number="03" label="Response shape" />
          <h2 className="mt-6 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
            Know exactly what comes back.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-8 text-muted-foreground">
            Legacy aliases remain part of the public contract. Integrations
            should map fields such as{" "}
            <code className="font-mono text-sm text-foreground">From</code>,{" "}
            <code className="font-mono text-sm text-foreground">Routes</code>,
            and{" "}
            <code className="font-mono text-sm text-foreground">
              Transfer Range
            </code>{" "}
            explicitly.
          </p>
          <div className="mt-8 space-y-4 border-l border-primary pl-5">
            {responseNotes.map((note) => (
              <p key={note} className="text-sm leading-6 text-muted-foreground">
                {note}
              </p>
            ))}
          </div>
        </div>
        <CodeBlock
          className="mt-0"
          code={sampleResponse}
          filename="route-response.json"
          language="json"
        />
      </div>
    </section>
  )
}

export function IntegrationExamplesSection({
  apiBaseUrl,
  defaultRequest,
}: {
  apiBaseUrl: string
  defaultRequest: RequestValues
}) {
  const sampleRouteUrl = `${apiBaseUrl}/api/routes?${new URLSearchParams(defaultRequest).toString()}`
  const examples = [
    { name: "curl", language: "bash", code: `curl "${sampleRouteUrl}"` },
    {
      name: "fetch.ts",
      language: "typescript",
      code: `const params = new URLSearchParams(${JSON.stringify(defaultRequest, null, 2)})\n\nconst response = await fetch(\`${apiBaseUrl}/api/routes?\${params.toString()}\`)\nif (!response.ok) throw new Error("Route request failed")\n\nconst data = await response.json()\nconsole.log(data.Routes)`,
    },
    {
      name: "requests.py",
      language: "python",
      code: `import requests\n\nparams = ${JSON.stringify(defaultRequest, null, 2)}\nresponse = requests.get("${apiBaseUrl}/api/routes", params=params, timeout=30)\nresponse.raise_for_status()\nprint(response.json()["Routes"])`,
    },
    {
      name: "RoutePreview.tsx",
      language: "tsx",
      code: `import { useEffect, useState } from "react"

export function RoutePreview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(${JSON.stringify(defaultRequest, null, 2)})

    fetch(\`${apiBaseUrl}/api/routes?\${params.toString()}\`)
      .then((response) => {
        if (!response.ok) throw new Error("Request failed")
        return response.json()
      })
      .then(setData)
      .catch((requestError) => setError(requestError.message))
  }, [])

  if (error) return <p>{error}</p>
  if (!data) return <p>Loading route...</p>

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}`,
    },
  ]
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="grid gap-8 lg:grid-cols-[minmax(17rem,0.62fr)_minmax(0,1.38fr)] lg:gap-16">
        <div>
          <SectionEyebrow number="04" label="Integration examples" />
          <h2 className="mt-6 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
            Use the stack
            <span className="block text-muted-foreground">
              you already have.
            </span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground">
            Every snippet uses the current public endpoint and sample values
            from the playground. Pick a starting point and adapt it to your
            application.
          </p>
        </div>
        <CodeBlock filename="curl" language="bash" tabs={examples} />
      </div>
    </section>
  )
}

export function CallToActionSection({
  apiDocsUrl,
  healthUrl,
  runRouteRequest,
}: {
  apiDocsUrl: string
  healthUrl: string
  runRouteRequest: () => void
}) {
  return (
    <section className="relative z-10 overflow-hidden border-t border-border bg-primary text-primary-foreground">
      <div className="pointer-events-none absolute -top-28 right-0 size-96 rounded-full border-[3rem] border-primary-foreground/10" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <p className="text-xs font-bold tracking-[0.18em] uppercase opacity-70">
          Next step
        </p>
        <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-3xl text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
            Validate the service, inspect the contract, then send your first
            route.
          </h2>
          <div className="flex flex-wrap gap-3">
            <ActionLink href={apiDocsUrl} label="Open API docs" />
            <ActionLink href={healthUrl} label="Test /health" />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-primary-foreground/10"
              onClick={runRouteRequest}
            >
              Run playground request <RiArrowRightLine className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionEyebrow({
  inverse = false,
  label,
  number,
}: {
  inverse?: boolean
  label: string
  number: string
}) {
  return (
    <div
      className={`flex items-center gap-3 text-xs font-bold tracking-[0.18em] uppercase ${inverse ? "text-background/60" : "text-muted-foreground"}`}
    >
      <span
        className={`font-mono ${inverse ? "text-primary" : "text-primary-foreground dark:text-primary"}`}
      >
        {number}
      </span>
      <span
        className={inverse ? "h-px w-9 bg-background/30" : "h-px w-9 bg-border"}
      />
      {label}
    </div>
  )
}

function BaselineFact({
  detail,
  number,
  title,
}: {
  detail: string
  number: string
  title: string
}) {
  return (
    <div className="border-background/15 px-5 py-7 sm:border-r sm:px-8 sm:py-8 sm:last:border-r-0">
      <p className="font-mono text-xs font-bold text-primary">{number}</p>
      <p className="mt-3 text-base font-bold">{title}</p>
      <p className="mt-2 max-w-xs text-sm leading-6 text-background/72">
        {detail}
      </p>
    </div>
  )
}

function ApiRouteRow({ note, route }: { note: string; route: string }) {
  return (
    <div className="grid gap-3 border-b border-border py-6 sm:grid-cols-[4rem_minmax(8rem,0.75fr)_minmax(0,1.25fr)] sm:items-center sm:gap-6">
      <span className="w-fit rounded-full bg-primary/20 px-2.5 py-1 font-mono text-[10px] font-bold text-primary-foreground dark:text-primary">
        GET
      </span>
      <code className="font-mono text-sm font-bold text-foreground">
        {route}
      </code>
      <p className="text-sm leading-6 text-muted-foreground">{note}</p>
    </div>
  )
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary-foreground/85"
    >
      {label} <RiArrowRightUpLine className="size-4" />
    </a>
  )
}
