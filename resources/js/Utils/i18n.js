import { usePage } from '@inertiajs/react';
import ar from '../locales/ar';
import en from '../locales/en';

const locales = { ar, en };

/**
 * Resolve a nested key from an object (e.g., 'company.dashboard.title')
 */
function getNested(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);
}

/**
 * Format string with replacements (:key or {key})
 */
function formatString(template, replacements = {}) {
    if (typeof template !== 'string') return template;
    let result = template;
    for (const [k, v] of Object.entries(replacements)) {
        result = result.replace(new RegExp(`:${k}|\\{${k}\\}`, 'g'), v);
    }
    return result;
}

/**
 * Standalone translation function
 */
export function trans(key, replacements = {}, locale = 'ar', defaultVal = '') {
    const dict = locales[locale] || locales.ar;
    let value = getNested(dict, key);

    // Fallback to Arabic if not found in target locale
    if (value === undefined && locale !== 'ar') {
        value = getNested(locales.ar, key);
    }

    // Direct key fallback (e.g. status keys like 'active', or common keys)
    if (value === undefined) {
        if (dict.status && dict.status[key]) {
            value = dict.status[key];
        } else if (dict.common && dict.common[key]) {
            value = dict.common[key];
        }
    }

    if (value === undefined) {
        return defaultVal || key;
    }

    return formatString(value, replacements);
}

/**
 * React Hook for translations
 */
export function useTranslation() {
    const pageProps = usePage()?.props || {};
    const locale = pageProps.locale || 'ar';
    const isAr = locale === 'ar';

    const t = (key, replacements = {}, defaultVal = '') => {
        return trans(key, replacements, locale, defaultVal);
    };

    return {
        t,
        locale,
        isAr,
        trans: t,
        __: t,
    };
}

export default {
    trans,
    useTranslation,
    locales,
};
