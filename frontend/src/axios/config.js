import axios from 'axios'

let ax = axios.create()

// Use VITE_BACKEND_URL when explicitly set (e.g. embedded/production builds),
// fall back to '/api' for local dev server.
if (import.meta.env.VITE_BACKEND_URL) {
    ax.defaults.baseURL = import.meta.env.VITE_BACKEND_URL
} else {
    ax.defaults.baseURL = '/api'
}

ax.interceptors.request.use(
    (config) => {
        // Route HF API requests to a different port if needed
        if (config.url && config.url.startsWith('/api/hf')) {
            const hfPort = import.meta.env.VITE_HF_API_PORT;
            if (hfPort) {
                // Determine current location to rewrite the URL correctly
                const currentProtocol = window.location.protocol;
                const currentHostname = window.location.hostname;
                // Only overwrite if we need to hit a different port
                if (window.location.port !== String(hfPort)) {
                    config.baseURL = `${currentProtocol}//${currentHostname}:${hfPort}`;
                }
            }
        }

        if (
            config.headers['Content-Type'] && (
            config.headers['Content-Type'].includes('x-www-form-urlencoded') ||
            config.headers['Content-Type'].includes('multipart/form-data'))
        ) {
            let formData = new FormData()
            for (let item in config.data) {
                if (config.data[item]) {
                    if (Array.isArray(config.data[item])) {
                        for (let i of config.data[item]) {
                            formData.append(item, i)
                        }
                    } else formData.append(item, config.data[item])
                }
            }
            config.data = formData
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default ax
