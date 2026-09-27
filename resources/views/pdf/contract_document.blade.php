<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>عقد اتفاقية إلكترونية - {{ $contract->contract_number }}</title>
    <style>
        @page {
            margin: 25px 25px 35px 25px;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            direction: rtl;
            text-align: right;
            color: #0f172a;
            font-size: 11px;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-bottom: 3px solid #6320EE;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }
        .header-table td {
            vertical-align: middle;
        }
        .org-title {
            font-size: 18px;
            font-weight: bold;
            color: #6320EE;
            margin: 0 0 4px 0;
        }
        .org-subtitle {
            font-size: 10px;
            color: #64748b;
            margin: 0;
            line-height: 1.4;
        }
        .logo-img {
            max-height: 55px;
            max-width: 160px;
        }
        .banner {
            background-color: #f5f3ff;
            border: 1px solid #ddd6fe;
            border-right: 4px solid #6320EE;
            padding: 10px 14px;
            margin-bottom: 16px;
            border-radius: 4px;
        }
        .banner-title {
            font-size: 15px;
            font-weight: bold;
            color: #4c1d95;
            margin: 0 0 3px 0;
        }
        .banner-meta {
            font-size: 10px;
            color: #6d28d9;
        }
        .grid-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            background-color: #fafafa;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        .grid-table td {
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10.5px;
        }
        .lbl {
            font-weight: bold;
            color: #475569;
            width: 20%;
            background-color: #f1f5f9;
        }
        .val {
            color: #0f172a;
            width: 30%;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1e1b4b;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin: 16px 0 8px 0;
        }
        .terms-content {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 14px;
            margin-bottom: 20px;
            font-size: 10.5px;
            color: #1e293b;
            border-radius: 4px;
            line-height: 1.7;
        }
        .terms-content p {
            margin: 0 0 8px 0;
        }
        .terms-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        .terms-content th, .terms-content td {
            border: 1px solid #cbd5e1;
            padding: 6px;
            text-align: right;
        }
        .terms-content th {
            background-color: #f1f5f9;
            font-weight: bold;
        }
        .signatures-table {
            width: 100%;
            margin-top: 20px;
            page-break-inside: avoid;
        }
        .sig-box {
            border: 1px dashed #94a3b8;
            padding: 12px;
            text-align: center;
            border-radius: 6px;
            background-color: #ffffff;
            height: 95px;
        }
        .sig-title {
            font-size: 11px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 6px;
        }
        .sig-status {
            font-size: 9.5px;
            color: #059669;
            font-weight: bold;
            margin-top: 25px;
        }
        .footer-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            text-align: center;
            font-size: 8.5px;
            color: #64748b;
        }
        .watermark {
            position: fixed;
            top: 40%;
            left: 20%;
            width: 60%;
            text-align: center;
            font-size: 38px;
            color: #e2e8f0;
            opacity: 0.35;
            transform: rotate(-30deg);
            z-index: -1000;
            font-weight: bold;
        }
    </style>
</head>
<body>

    @if(!empty($settings['pdf_show_watermark']) && !empty($settings['pdf_watermark_text']))
        <div class="watermark">{{ $settings['pdf_watermark_text'] }}</div>
    @endif

    {{-- Official Header with Platform Logo & Metadata --}}
    <table class="header-table">
        <tr>
            <td style="width: 65%;">
                <div class="org-title">{{ $settings['pdf_header_org_name'] ?? 'منصة GoTransTech للتمويل اللوجستي' }}</div>
                <div class="org-subtitle">
                    {{ $settings['pdf_header_subtitle'] ?? 'المملكة العربية السعودية - سجل تجاري معتمد' }}<br>
                    {{ $settings['pdf_header_tax_number'] ?? 'الرقم الضريبي: 310298374600003' }}
                </div>
            </td>
            <td style="width: 35%; text-align: left;">
                @if(!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" class="logo-img" alt="Logo" />
                @else
                    <div style="font-size: 18px; font-weight: bold; color: #6320EE;">GoTransTech</div>
                @endif
            </td>
        </tr>
    </table>

    {{-- Contract Title Banner --}}
    <div class="banner">
        <table style="width: 100%;">
            <tr>
                <td>
                    <div class="banner-title">{{ $contract->title }}</div>
                    <div class="banner-meta">
                        رقم العقد: <strong>{{ $contract->contract_number }}</strong> | 
                        تاريخ السريان: <strong>{{ $contract->start_date ? $contract->start_date->format('Y-m-d') : now()->format('Y-m-d') }}</strong>
                        @if($contract->end_date)
                            | تاريخ الانتهاء: <strong>{{ $contract->end_date->format('Y-m-d') }}</strong>
                        @endif
                    </div>
                </td>
                <td style="text-align: left;">
                    <span style="background-color: #6320EE; color: #ffffff; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: bold;">
                        {{ $contract->status === 'active' ? 'عقد سارٍ ومعتمد' : $contract->status }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    {{-- Parties Information Grid --}}
    <div class="section-title">بيانات أطراف الاتفاقية والتعاقد:</div>
    <table class="grid-table">
        <tr>
            <td class="lbl">الطرف الأول:</td>
            <td class="val"><strong>منصة GoTransTech للتمويل اللوجستي</strong></td>
            <td class="lbl">الصفة:</td>
            <td class="val">الوسيط التقني والتشغيلي المعتمد</td>
        </tr>
        <tr>
            <td class="lbl">الطرف الثاني:</td>
            <td class="val"><strong>{{ $contract->user->name }}</strong></td>
            <td class="lbl">نوع الطرف:</td>
            <td class="val">{{ $contract->party_type === 'company' ? 'شركة لوجستية مرخصة' : 'مستثمر أفراد / مؤسسات' }}</td>
        </tr>
        <tr>
            <td class="lbl">البريد الإلكتروني:</td>
            <td class="val">{{ $contract->user->email }}</td>
            <td class="lbl">رقم التواصل:</td>
            <td class="val">{{ $contract->user->phone ?? 'غير مسجل' }}</td>
        </tr>
        <tr>
            <td class="lbl">نسبة العمولة المتفق عليها:</td>
            <td class="val"><strong style="color: #6320EE; font-size: 12px;">{{ number_format($contract->commission_rate, 2) }}%</strong></td>
            <td class="lbl">نوع التعاقد:</td>
            <td class="val">{{ $contract->contract_type === 'logistics_service' ? 'تقديم خدمات لوجستية' : 'اتفاقية استثمار وعوائد' }}</td>
        </tr>
    </table>

    {{-- Terms & Conditions Content --}}
    <div class="section-title">بنود وشروط ومسؤوليات العقد:</div>
    <div class="terms-content">
        {!! $contract->terms_text !!}
    </div>

    {{-- Signatures & Stamp --}}
    <table class="signatures-table">
        <tr>
            <td style="width: 48%; padding-left: 8px;">
                <div class="sig-box">
                    <div class="sig-title">توقيع الطرف الثاني ({{ $contract->user->name }})</div>
                    <div class="sig-status">
                        ✓ تم التوقيع الإلكتروني بموجب الهوية والرمز في {{ $contract->created_at->format('Y-m-d H:i') }}
                    </div>
                </div>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%; padding-right: 8px;">
                <div class="sig-box">
                    <div class="sig-title">{{ $settings['pdf_stamp_title'] ?? 'الختم والتوقيع الرقمي المعتمد' }}</div>
                    <div class="sig-status">
                        ✓ تم التوثيق الرسمي بواسطة الإدارة في {{ $contract->signed_at ? $contract->signed_at->format('Y-m-d H:i') : now()->format('Y-m-d H:i') }}
                    </div>
                </div>
            </td>
        </tr>
    </table>

    {{-- Official Footer --}}
    <div class="footer-bar">
        {{ $settings['pdf_footer_legal_text'] ?? 'وثيقة إلكترونية رسمية صادرة من منصة GoTransTech بموجب نظام التعاملات الإلكترونية السعودي.' }}
        - تم التوليد آلياً بتاريخ: {{ now()->format('Y-m-d H:i') }}
    </div>

</body>
</html>
