# Polygon Reverse Proxy

A lightweight reverse proxy built for Cloudflare Workers that selectively routes specific paths to a target domain while passing through all other requests to the original domain.

## Overview

This reverse proxy acts as a smart router that:
- Intercepts requests to specific configured routes
- Forwards those requests to a target domain
- Passes all other requests through unchanged to the original domain
- Preserves all request headers, methods, query parameters, and body content

## How It Works

The proxy uses pattern matching to determine which requests to forward:

1. **Request Interception**: Every incoming request is analyzed
2. **Route Matching**: The pathname is checked against configured proxy routes
3. **Conditional Forwarding**: 
   - Matching routes → forwarded to `PROXY_TARGET`
   - Non-matching routes → passed through to original domain
4. **Response Relay**: The target server's response is returned to the client

## Configuration

### PROXY_TARGET
The destination domain where specific routes will be forwarded.

```javascript
const PROXY_TARGET = '<new-domain.com>';
```

### PROXY_ROUTES
An array of path patterns that should be proxied to the target domain.

```javascript
const PROXY_ROUTES = ['/', '/about', '/contactUs'];
```

## Route Matching Logic

The proxy matches routes using exact path matching and prefix matching:

- **Exact Match**: `/about` matches exactly `/about`
- **Prefix Match**: `/about` also matches `/about/team`, `/about/history`, etc.

Example with current configuration:
- `example.com/` → forwarded to `new-domain.com/`
- `example.com/about` → forwarded to `new-domain.com/about`
- `example.com/contactUs` → forwarded to `new-domain.com/contactUs`
- `example.com/products` → passed through to `example.com/products`

## Request Preservation

The proxy maintains complete request integrity:
- **Method**: GET, POST, PUT, DELETE, etc.
- **Headers**: All original headers are forwarded
- **Body**: Request body is passed through unchanged
- **Query Parameters**: All query strings are preserved

Example:
```
Original: POST https://example.com/contactUs?source=landing
Proxied:  POST https://new-domain.com/contactUs?source=landing
```

## Deployment

This worker is designed for Cloudflare Workers:

1. Update the `PROXY_TARGET` with your target domain
2. Configure `PROXY_ROUTES` with the paths you want to proxy
3. Deploy to Cloudflare Workers
4. Route your domain through the worker

## Technical Details

**Platform**: Cloudflare Workers
**Runtime**: V8 JavaScript Engine
**Protocol**: HTTP/HTTPS
**Response Handling**: Streams response body for efficient memory usage

## Notes

- The proxy preserves the original request's pathname and search parameters
- Response status codes, headers, and body are all forwarded from the target
- Console logs are available in Cloudflare Workers dashboard for debugging
