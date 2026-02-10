# Polygon Reverse Proxy

A lightweight reverse proxy implementation designed for Cloudflare Workers that selectively routes specific URL paths to a target domain while passing through all other requests to the original domain.

## What Does This Code Do?

This reverse proxy acts as an intelligent traffic router that:

1. **Intercepts incoming HTTP requests** to your domain
2. **Checks if the request path matches** any of the configured proxy routes
3. **Routes matching requests** to a specified target domain (e.g., new-domain.com)
4. **Passes through non-matching requests** to the original domain unchanged

This allows you to gradually migrate specific sections of your website to a new domain or backend without changing your main domain or requiring complex DNS changes.

## Use Cases

- **Gradual Migration**: Move specific pages or sections of your website to a new domain while keeping the rest on the original infrastructure
- **A/B Testing**: Route certain paths to different backends for testing purposes
- **Microservices Architecture**: Direct specific routes to different microservices while maintaining a unified domain
- **Content Distribution**: Serve specific content from specialized servers or CDNs

## How It Works

The reverse proxy operates on Cloudflare Workers edge network, intercepting requests before they reach your origin server:

```
User Request → Cloudflare Workers → Reverse Proxy Logic
                                         ↓
                        ┌────────────────┴────────────────┐
                        ↓                                  ↓
              Matches PROXY_ROUTES?              Doesn't Match?
                        ↓                                  ↓
              Forward to PROXY_TARGET          Pass through to origin
                   (new-domain.com)                  (original domain)
```

## Configuration

The proxy behavior is controlled by two main configuration variables at the top of `reverse-proxy.js`:

### `PROXY_TARGET`
The target domain where matching requests should be forwarded.

```javascript
const PROXY_TARGET = '<new-domain.com>';
```

**Example**: `const PROXY_TARGET = 'api.newsite.com';`

### `PROXY_ROUTES`
An array of URL paths that should be proxied to the target domain. Each route is matched using this logic:
- Exact path match: `url.pathname === route`
- Path prefix match: `url.pathname.startsWith(route + '/')`

This means most routes will match themselves and any subpaths, but `/` is special - it only matches the root path exactly.

```javascript
const PROXY_ROUTES = ['/', '/payments', '/page2', '/grants'];
```

**Example routes**:
- `/` - Matches only the root path exactly (`yoursite.com/` or `yoursite.com`), not subpaths. This is because the prefix check requires paths to start with `//` (i.e., `/` + `/`), which normal paths like `/about` or `/api` do not match.
- `/api` - Matches `/api` exactly and all subpaths starting with `/api/` (e.g., `/api/users`, `/api/data`)
- `/blog` - Matches `/blog` exactly and all subpaths starting with `/blog/` (e.g., `/blog/post-1`, `/blog/2024/article`)

## Setup and Deployment

### Prerequisites
- A Cloudflare account
- Cloudflare Workers enabled for your domain
- Wrangler CLI (optional, for local development)

### Configuration Steps

1. **Update the target domain**:
   ```javascript
   const PROXY_TARGET = 'your-target-domain.com';
   ```

2. **Configure the routes to proxy**:
   ```javascript
   const PROXY_ROUTES = ['/api', '/new-section', '/beta'];
   ```

3. **Deploy to Cloudflare Workers**:
   - Copy the contents of `reverse-proxy.js`
   - Paste into your Cloudflare Workers editor
   - Deploy to your domain

## Example Scenarios

### Scenario 1: Migrating Payment Pages
You're migrating your payment system to a new infrastructure but want to keep everything else on the old system:

```javascript
const PROXY_TARGET = 'payments.newplatform.com';
const PROXY_ROUTES = ['/payments', '/checkout', '/invoice'];
```

Result:
- `yoursite.com/payments/*` → forwarded to `payments.newplatform.com/payments/*`
- `yoursite.com/about` → served from original domain
- `yoursite.com/contact` → served from original domain

### Scenario 2: API Gateway
Route all API calls to a dedicated API server:

```javascript
const PROXY_TARGET = 'api.backend.com';
const PROXY_ROUTES = ['/api'];
```

Result:
- `yoursite.com/api/*` → forwarded to `api.backend.com/api/*`
- All other pages → served from original domain

## Technical Details

### Request Handling
- **Method Preservation**: The proxy forwards the original HTTP method (GET, POST, PUT, DELETE, etc.)
- **Header Forwarding**: All request headers are forwarded to the target domain
- **Body Forwarding**: Request bodies are forwarded for POST/PUT requests
- **Query Parameters**: URL query parameters are preserved and forwarded

### Response Handling
- The proxy returns the complete response from the target domain, including:
  - Status codes
  - Response headers
  - Response body
  - Content-Type and other metadata

### Logging
The proxy includes console logging for debugging:
- Logs all incoming request URLs
- Logs when a request is being proxied and to which destination

## Limitations and Considerations

1. **Cloudflare Workers Limits**: Subject to Cloudflare Workers request/CPU time limits
2. **CORS**: Make sure your target domain has appropriate CORS headers if making cross-origin requests
3. **Session/Cookies**: Cookie domains should be configured appropriately on both domains
4. **SSL/TLS**: Both domains should have valid SSL certificates
5. **Performance**: The reverse proxy adds an additional network hop which introduces some latency overhead. The actual performance impact varies based on geographic location, backend response times, and Cloudflare's edge network proximity to users.

## Code Structure

```javascript
// Configuration section
const PROXY_TARGET = '<new-domain.com>';
const PROXY_ROUTES = ['/', '/payments', '/page2', '/grants'];

export default {
    async fetch(request) {
        // Parse the incoming request URL
        // Check if the path matches any proxy routes
        // If yes: forward to PROXY_TARGET
        // If no: pass through to original domain
    }
};
```

## Contributing

Feel free to submit issues or pull requests to improve the proxy functionality.
