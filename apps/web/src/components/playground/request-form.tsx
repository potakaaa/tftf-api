import type React from "react"
import {
  RiArrowRightSLine,
  RiLoader4Line,
  RiMap2Line,
  RiMapPin2Line,
  RiRestartLine,
  RiRouteLine,
  RiTimeLine,
} from "@remixicon/react"
import { Button } from "@workspace/ui/components/button"

import type { RequestValues } from "./model"

export function RequestForm({
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
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-foreground outline-none"
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
