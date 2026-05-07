import { TwikitError } from "../errors.js"

export function notImplemented(operation: string): TwikitError {
  return new TwikitError({
    kind: "unknown",
    operation,
    message: `${operation} is not implemented yet.`,
  })
}
