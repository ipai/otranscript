import { NextResponse, type NextRequest } from "next/server";

const corsOptions: {
  allowedMethods: string[];
  allowedOrigins: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge?: number;
  credentials: boolean;
} = {
  allowedMethods: (process.env?.ALLOWED_METHODS || "").split(","),
  allowedOrigins: (process.env?.ALLOWED_ORIGIN || "").split(","),
  allowedHeaders: (process.env?.ALLOWED_HEADERS || "").split(","),
  exposedHeaders: (process.env?.EXPOSED_HEADERS || "").split(","),
  maxAge:
    (process.env?.PREFLIGHT_MAX_AGE &&
      parseInt(process.env?.PREFLIGHT_MAX_AGE)) ||
    undefined, // 60 * 60 * 24 * 30, // 30 days
  credentials: process.env?.CREDENTIALS == "true",
};

/**
 * Middleware function that handles CORS configuration for API routes.
 *
 * This middleware function is responsible for setting the appropriate CORS headers
 * on the response, based on the configured CORS options. It checks the origin of
 * the request and sets the `Access-Control-Allow-Origin` header accordingly. It
 * also sets the other CORS-related headers, such as `Access-Control-Allow-Credentials`,
 * `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, and
 * `Access-Control-Expose-Headers`.
 *
 * The middleware function is configured to be applied to all API routes, as defined
 * by the `config` object at the end of the file.
 */
export function middleware(request: NextRequest) {
  // Response
  const response = NextResponse.next();

  // Allowed origins check
  const origin = request.headers.get("origin") ?? "";
  if (
    corsOptions.allowedOrigins.includes("*") ||
    corsOptions.allowedOrigins.includes(origin)
  ) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  // Set default CORS headers
  response.headers.set(
    "Access-Control-Allow-Credentials",
    corsOptions.credentials.toString()
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    corsOptions.allowedMethods.join(",")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    corsOptions.allowedHeaders.join(",")
  );
  response.headers.set(
    "Access-Control-Expose-Headers",
    corsOptions.exposedHeaders.join(",")
  );
  response.headers.set(
    "Access-Control-Max-Age",
    corsOptions.maxAge?.toString() ?? ""
  );

  // Return
  return response;
}

// Configure middleware matching and options
export const config = {
  matcher: ["/api/authenticate", "/api/process"],
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
    responseLimit: "50mb",
  },
};
