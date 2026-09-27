import axios from 'axios';
import { route } from 'ziggy-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

if (typeof window !== 'undefined') {
    window.route = (name, params, absolute, config) => {
        try {
            return route(name, params, absolute, config || window.Ziggy);
        } catch (e) {
            // Fallback for simple names if Ziggy routes aren't populated yet
            const fallbacks = {
                'login': '/login',
                'register': '/register',
                'landing': '/',
            };
            return fallbacks[name] || `/${name.replace(/\./g, '/')}`;
        }
    };
}
