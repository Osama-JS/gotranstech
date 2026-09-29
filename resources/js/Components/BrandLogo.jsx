import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Official GoTransTech (GTT) Brand Logo Component
 * - Dynamically displays custom uploaded logo from Admin CMS if present
 * - Falls back to the official high-resolution vector GTT monogram
 * - Automatically keeps browser favicon in sync with CMS branding settings
 */
export default function BrandLogo({
    size = null, // 'sm', 'md', 'lg', 'xl' (defaults to branding?.navbar_brand_size || 'md')
    variant = 'full', // 'full', 'icon', 'vertical', 'stacked'
    showSlogan = false,
    className = '',
    textClassName = '',
    isLight = false, // if explicitly on light background
    logoUrl = null,
    forceVector = false,
    displayMode = null, // 'logo', 'name', 'both'
}) {
    const pageProps = usePage()?.props || {};
    const branding = pageProps.branding || {};
    const effectiveSize = size ?? branding?.navbar_brand_size ?? 36;

    // Keep browser favicon in sync dynamically
    useEffect(() => {
        if (branding?.favicon) {
            const faviconEl = document.getElementById('app-favicon') || document.querySelector("link[rel*='icon']");
            if (faviconEl && faviconEl.getAttribute('href') !== branding.favicon) {
                faviconEl.setAttribute('href', branding.favicon);
            }
        }
    }, [branding?.favicon]);

    const customLogo = !forceVector ? (logoUrl || (!isLight && branding?.logo_dark ? branding.logo_dark : branding?.logo)) : null;

    // Convert effectiveSize to actual pixel height
    const isNamedSize = typeof effectiveSize === 'string' && ['sm', 'md', 'lg', 'xl'].includes(effectiveSize);
    const pixelHeight = isNamedSize
        ? (effectiveSize === 'sm' ? 28 : effectiveSize === 'lg' ? 48 : effectiveSize === 'xl' ? 64 : 36)
        : Math.max(20, Math.min(120, parseInt(effectiveSize, 10) || 36));

    // Dynamic proportional sizing configuration
    const cfg = {
        iconW: Math.round(pixelHeight * (160 / 110)),
        iconH: pixelHeight,
        imgH: pixelHeight,
        fontSize: Math.max(12, Math.round(pixelHeight * 0.52)),
        subFontSize: Math.max(8, Math.round(pixelHeight * 0.28)),
        sloganFontSize: Math.max(8, Math.round(pixelHeight * 0.26)),
        gap: Math.max(6, Math.round(pixelHeight * 0.26)),
    };

    const sloganAr = branding?.site_slogan_ar || 'نمول حركة الغد';
    const sloganEn = branding?.site_slogan_en || 'FINANCING WHAT MOVES TOMORROW';
    const siteName = branding?.site_name_ar || 'GoTransTech';

    const effectiveMode = displayMode || (variant === 'full' ? (branding?.navbar_brand_display || 'both') : null);

    const renderBrandName = () => {
        const name = branding?.site_name_ar || 'GoTransTech';
        if (name === 'GoTransTech' || name === 'Go-Tech') {
            return (
                <>
                    <span className={textClassName || (isLight ? 'text-slate-900' : 'text-slate-900 dark:text-white')}>GoTrans</span>
                    <span className="text-[#FF6B00] ml-0.5">Tech</span>
                </>
            );
        }
        return (
            <span className={textClassName || (isLight ? 'text-slate-900' : 'text-slate-900 dark:text-white')}>
                {name}
            </span>
        );
    };

    // 1. If display mode is set to 'name' only: render only the styled brand name
    if (effectiveMode === 'name') {
        return (
            <div className={`inline-flex items-center text-start ${className}`} style={{ gap: `${cfg.gap}px` }}>
                <div className={`font-black tracking-tight leading-none ${textClassName}`} style={{ fontSize: `${cfg.fontSize}px` }}>
                    {renderBrandName()}
                </div>
                {showSlogan && (
                    <span className="font-semibold text-violet-600 dark:text-violet-400 mr-2" style={{ fontSize: `${cfg.sloganFontSize}px` }}>
                        {sloganAr}
                    </span>
                )}
            </div>
        );
    }

    // Default Fallback: Official SVG GTT Vector Icon
    const GttIcon = ({ width = cfg.iconW, height = cfg.iconH }) => (
        <svg
            width={width}
            height={height}
            viewBox="0 0 160 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 drop-shadow-[0_2px_8px_rgba(99,32,238,0.25)]"
        >
            {/* Letter 'G' (Solid Royal Violet) */}
            <path
                d="M 58 14 
                   C 32 14, 12 33, 8 60 
                   C 4 84, 19 100, 44 100 
                   C 60 100, 72 92, 79 81 
                   L 66 81 
                   C 60 86, 52 90, 43 90 
                   C 26 90, 18 78, 20 62 
                   C 23 42, 36 24, 56 24 
                   C 68 24, 76 30, 80 40 
                   L 93 35 
                   C 87 21, 74 14, 58 14 Z"
                fill="#6320EE"
            />

            {/* First 'T' (Solid Royal Violet) */}
            <path
                d="M 72 16 
                   L 114 16 
                   L 110 30 
                   L 98 30 
                   L 81 98 
                   L 64 98 
                   L 81 30 
                   L 69 30 
                   Z"
                fill="#6320EE"
            />

            {/* Second 'T' (Solid Sunset Orange) */}
            <path
                d="M 104 16 
                   L 146 16 
                   L 155 18 
                   C 142 24, 134 27, 126 30 
                   L 109 98 
                   L 92 98 
                   L 109 30 
                   L 100 30 
                   L 104 16 
                   Z"
                fill="#FF6B00"
            />
            {/* Orange dynamic forward speed wing accent */}
            <path
                d="M 124 16 
                   L 160 5 
                   L 148 22 
                   C 138 20, 130 18, 124 16 Z"
                fill="#FF6B00"
            />
        </svg>
    );

    // 2. If display mode is set to 'logo' only OR variant is 'icon': render only the logo icon/image
    if (effectiveMode === 'logo' || variant === 'icon') {
        if (customLogo) {
            return (
                <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
                    <img
                        src={customLogo}
                        alt={siteName}
                        style={{ height: `${cfg.imgH}px`, maxHeight: `${cfg.imgH}px` }}
                        className="w-auto object-contain drop-shadow-[0_2px_8px_rgba(99,32,238,0.25)] transition-all duration-150"
                    />
                </div>
            );
        }
        return (
            <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
                <GttIcon width={cfg.iconW} height={cfg.iconH} />
            </div>
        );
    }

    if (variant === 'stacked') {
        return (
            <div className={`flex flex-col items-center text-center ${className}`}>
                {customLogo ? (
                    <img
                        src={customLogo}
                        alt={siteName}
                        style={{ height: `${Math.round(cfg.imgH * 1.3)}px`, maxHeight: `${Math.round(cfg.imgH * 1.3)}px` }}
                        className="w-auto object-contain drop-shadow-[0_4px_16px_rgba(99,32,238,0.35)] transition-all duration-150"
                    />
                ) : (
                    <GttIcon width={Math.round(cfg.iconW * 1.3)} height={Math.round(cfg.iconH * 1.3)} />
                )}
                <div className="mt-3">
                    <div className={`font-black tracking-tight leading-none ${textClassName}`} style={{ fontSize: `${cfg.fontSize}px` }}>
                        {renderBrandName()}
                    </div>
                    {showSlogan && (
                        <div className="mt-1.5 flex flex-col items-center">
                            <span className="font-bold text-violet-600 dark:text-violet-400" style={{ fontSize: `${cfg.sloganFontSize}px` }}>
                                {sloganAr}
                            </span>
                            <span className="font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400 text-[8px]">
                                {sloganEn}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 3. Default 'both' (or 'full') horizontal variant: Logo + Text Name
    return (
        <div className={`inline-flex items-center ${className}`} style={{ gap: `${cfg.gap}px` }}>
            {customLogo ? (
                <img
                    src={customLogo}
                    alt={siteName}
                    style={{ height: `${cfg.imgH}px`, maxHeight: `${cfg.imgH}px` }}
                    className="w-auto object-contain drop-shadow-[0_2px_10px_rgba(99,32,238,0.3)] shrink-0 transition-all duration-150"
                />
            ) : (
                <GttIcon width={cfg.iconW} height={cfg.iconH} />
            )}
            <div className="flex flex-col text-start justify-center">
                <div className={`font-black tracking-tight leading-none ${textClassName}`} style={{ fontSize: `${cfg.fontSize}px` }}>
                    {renderBrandName()}
                </div>
                {showSlogan ? (
                    <span className="font-semibold text-violet-600 dark:text-violet-400 mt-0.5 tracking-tight" style={{ fontSize: `${cfg.sloganFontSize}px` }}>
                        {sloganAr}
                    </span>
                ) : (
                    <span className="font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-0.5" style={{ fontSize: `${cfg.subFontSize}px` }}>
                        Logistics FinTech
                    </span>
                )}
            </div>
        </div>
    );
}
