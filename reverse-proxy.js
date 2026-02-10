// Configuration
const PROXY_TARGET = '<new-domain.com>';
const PROXY_ROUTES = ['/', '/payments', '/page2', '/grants'];
const HEADERS_TO_REMOVE = ['x-frame-options', 'content-security-policy'];

export default {
    async fetch(request) {
        const url = new URL(request.url);
        console.log(url);

        const shouldProxy = PROXY_ROUTES.some(route =>
            url.pathname === route || url.pathname.startsWith(route + '/')
        );

        if (shouldProxy) {
            console.log(`Proxy to: ${PROXY_TARGET}${url.pathname}`);

            const response = await fetch(`https://${PROXY_TARGET}${url.pathname}${url.search}`, {
                method: request.method,
                headers: request.headers,
                body: request.body,
            });

            const newResponse = new Response(response.body, response);
            HEADERS_TO_REMOVE.forEach(header => newResponse.headers.delete(header));

            return newResponse;
        }

        // All other routes: pass through to original domain
        return fetch(request);
    }
};