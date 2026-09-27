import React, { useMemo } from 'react';
import { COUNTRIES } from './PhoneInput';

export default function PhoneDisplay({ countryCode = '+966', phone, className = '' }) {
    if (!phone) {
        return <span className="text-slate-500 font-mono text-xs">-</span>;
    }

    const country = useMemo(() => {
        if (!countryCode) return null;
        return COUNTRIES.find((c) => c.code === countryCode);
    }, [countryCode]);

    return (
        <span
            dir="ltr"
            className={`inline-flex items-center gap-1.5 font-mono text-xs text-slate-300 ${className}`}
        >
            {country?.flag && <span className="text-sm select-none">{country.flag}</span>}
            <span className="font-semibold text-violet-400">{countryCode || '+966'}</span>
            <span>{phone}</span>
        </span>
    );
}
