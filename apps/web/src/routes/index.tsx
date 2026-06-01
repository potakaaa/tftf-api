import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Spotlight } from "@workspace/ui/components/spotlight-new"

import {
  ApiGuideSection,
  CallToActionSection,
  DatasetSection,
  IntegrationExamplesSection,
  ResponseShapeSection,
} from "@/components/playground/documentation-sections"
import {
  defaultRequest,
  getInitialTheme,
  validateRequest,
} from "@/components/playground/model"
import type {
  HealthState,
  RequestValues,
  RouteResponse,
  Theme,
} from "@/components/playground/model"
import { PlaygroundSection } from "@/components/playground/playground-section"
import { SiteFooter, SiteHeader } from "@/components/playground/site-chrome"

export const Route = createFileRoute("/")({ component: App })

const apiBaseUrl =
  import.meta.env["VITE_API_BASE_URL"] ?? "http://127.0.0.1:8000"
const apiDocsUrl = `${apiBaseUrl}/docs`
const healthUrl = `${apiBaseUrl}/health`

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
      const result = await fetch(healthUrl)
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
      <Spotlight className="top-8 h-[48rem] opacity-50 dark:opacity-75" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[36rem] bg-[radial-gradient(circle_at_18%_12%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent_26%),radial-gradient(circle_at_78%_0%,color-mix(in_oklch,var(--primary)_13%,transparent),transparent_25%)] dark:opacity-70" />

      <SiteHeader
        apiDocsUrl={apiDocsUrl}
        theme={theme}
        toggleTheme={() =>
          setTheme((current) => (current === "light" ? "dark" : "light"))
        }
      />
      <PlaygroundSection
        apiBaseUrl={apiBaseUrl}
        checkHealth={checkHealth}
        error={error}
        health={health}
        isLoading={isLoading}
        request={request}
        resetRequest={resetRequest}
        response={response}
        routeUrl={routeUrl}
        runRouteRequest={runRouteRequest}
        updateRequest={updateRequest}
      />
      <DatasetSection />
      <ApiGuideSection apiDocsUrl={apiDocsUrl} />
      <ResponseShapeSection />
      <IntegrationExamplesSection
        apiBaseUrl={apiBaseUrl}
        defaultRequest={defaultRequest}
      />
      <CallToActionSection
        apiDocsUrl={apiDocsUrl}
        healthUrl={healthUrl}
        runRouteRequest={runRouteRequest}
      />
      <SiteFooter apiDocsUrl={apiDocsUrl} />
    </main>
  )
}
