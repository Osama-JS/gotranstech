import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Official GoTransTech (GTT) Brand Logo Component
 * - Dynamically displays custom uploaded logo from Admin CMS if present
 * - Falls back to the official high-resolution vector GTT monogram
 * - Automatically keeps browser favicon in sync with CMS branding settings
 */
export default function BrandLogo({
    size = 'md', // 'sm', 'md', 'lg', 'xl'
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

    // Sizing maps
    const sizeConfig = {
        sm: {
            iconW: 36,
            iconH: 26,
            imgH: 'h-7 max-h-7',
            textClass: 'text-base',
            subTextClass: 'text-[9px]',
            sloganClass: 'text-[8px]',
            gap: 'gap-2',
        },
        md: {
            iconW: 46,
            iconH: 32,
            imgH: 'h-9 max-h-9',
            textClass: 'text-xl',
            subTextClass: 'text-[11px]',
            sloganClass: 'text-[10px]',
            gap: 'gap-3',
        },
        lg: {
            iconW: 64,
            iconH: 45,
            imgH: 'h-12 max-h-12',
            textClass: 'text-2xl sm:text-3xl',
            subTextClass: 'text-xs',
            sloganClass: 'text-xs',
            gap: 'gap-3.5',
        },
        xl: {
            iconW: 96,
            iconH: 68,
            imgH: 'h-16 max-h-16',
            textClass: 'text-4xl sm:text-5xl',
            subTextClass: 'text-sm',
            sloganClass: 'text-sm',
            gap: 'gap-4',
        },
    };

    const cfg = sizeConfig[size] || sizeConfig.md;
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
            <div className={`inline-flex items-center text-start ${className}`}>
                <div className={`font-black tracking-tight leading-none ${cfg.textClass} ${textClassName}`}>
                    {renderBrandName()}
                </div>
                {showSlogan && (
                    <span className={`font-semibold text-violet-600 dark:text-violet-400 ${cfg.sloganClass} mr-2`}>
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
                        className={`${cfg.imgH} w-auto object-contain drop-shadow-[0_2px_8px_rgba(99,32,238,0.25)]`}
                    />
                </div>
            );
        }
        return (
            <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
                <GttIcon />
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
                        className={`${size === 'xl' ? 'max-h-24' : 'max-h-16 sm:max-h-20'} w-auto object-contain drop-shadow-[0_4px_16px_rgba(99,32,238,0.35)]`}
                    />
                ) : (
                    <GttIcon width={cfg.iconW * 1.3} height={cfg.iconH * 1.3} />
                )}
                <div className="mt-3">
                    <div className={`font-black tracking-tight leading-none ${cfg.textClass}`}>
                        {renderBrandName()}
                    </div>
                    {showSlogan && (
                        <div className="mt-1.5 flex flex-col items-center">
                            <span className={`font-bold text-violet-600 dark:text-violet-400 ${cfg.sloganClass}`}>
                                {sloganAr}
                            </span>
                            <span className={`font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400 ${cfg.sloganClass} text-[8px]`}>
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
        <div className={`inline-flex items-center ${cfg.gap} ${className}`}>
            {customLogo ? (
                <img
                    src={customLogo}
                    alt={siteName}
                    className={`${cfg.imgH} w-auto object-contain drop-shadow-[0_2px_10px_rgba(99,32,238,0.3)]`}
                />
            ) : (
                <GttIcon />
            )}
            <div className="flex flex-col text-start">
                <div className={`font-black tracking-tight leading-none ${cfg.textClass} ${textClassName}`}>
                    {renderBrandName()}
                </div>
                {showSlogan ? (
                    <span className={`font-semibold text-violet-600 dark:text-violet-400 ${cfg.sloganClass} mt-0.5 tracking-tight`}>
                        {sloganAr}
                    </span>
                ) : (
                    <span className={`font-mono text-slate-500 dark:text-slate-400 ${cfg.subTextClass} tracking-wider uppercase -mt-0.5`}>
                        Logistics FinTech
                    </span>
                )}
            </div>
        </div>
    );
}
