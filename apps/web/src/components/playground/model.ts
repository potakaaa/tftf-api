export const defaultRequest = {
  fromLat: "8.50881",
  fromLong: "124.64827",
  fromName: "Bonbon",
  toLat: "8.51133",
  toLong: "124.62429",
  toName: "Westbound Bulua Terminal",
  transMeter: "100.5",
  hour: "10",
}

export type RequestValues = typeof defaultRequest
export type HealthState = "idle" | "loading" | "online" | "offline"
export type Theme = "light" | "dark"
export type RouteLeg = {
  "Route ID": number
  "Route Name": string
  "Transfer Cost": number
  "Entry Coordinate": [number, number]
  "Exit Coordinate": [number, number]
}
export type RouteResponse = {
  From: { Lattitude: number; Longitude: number; "Origin Name": string }
  Routes: RouteLeg[]
  To: { Lattitude: number; Longitude: number; "Destination Name": string }
  "Transfer Range": number
}

export function validateRequest(request: RequestValues) {
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

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const savedTheme = window.localStorage.getItem("tftf-theme")
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}
