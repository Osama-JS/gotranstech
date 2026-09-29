<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() == 'ar' ? 'rtl' : 'ltr' }}" class="dark overflow-x-hidden">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @php
        $rawFavicon = \App\Services\EncryptedSettingService::get('platform_favicon');
        $customFavicon = $rawFavicon ? (str_starts_with($rawFavicon, 'http') ? $rawFavicon : asset(ltrim($rawFavicon, '/'))) : null;
        $siteTitle = \App\Services\EncryptedSettingService::get('site_name_ar', config('app.name', 'GoTransTech'));
    @endphp

    <title inertia>{{ $siteTitle }}</title>

    <!-- Dynamic Browser Favicon from CMS Branding -->
    <link rel="icon" id="app-favicon" href="{{ $customFavicon ?: asset('favicon.ico') }}">

    <!-- Theme Initialization to avoid FOUC -->
    <script>
        (function() {
            try {
                const savedTheme = localStorage.getItem('gotech_theme') || 'dark';
                if (savedTheme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                }
            } catch (e) {}
        })();
    </script>

    <!-- Google Fonts: Cairo for Arabic & Outfit / Inter for English -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased min-h-screen selection:bg-violet-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
    @inertia
</body>
</html>
