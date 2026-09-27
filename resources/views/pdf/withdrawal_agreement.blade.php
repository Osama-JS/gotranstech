<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>سند طلب سحب تمويل لوجستي - {{ $request->request_number }}</title>
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
            color: #431407;
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
            margin: 14px 0 8px 0;
        }
        .tasks-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            font-size: 10px;
        }
        .tasks-table th {
            background-color: #6320EE;
            color: #ffffff;
            font-weight: bold;
            padding: 7px 8px;
            text-align: right;
            border: 1px solid #6320EE;
        }
        .tasks-table td {
            padding: 6px 8px;
            border: 1px solid #e2e8f0;
            text-align: right;
        }
        .tasks-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .total-card {
            background-color: #fff7ed;
            border: 1px solid #ffedd5;
            border-right: 4px solid #FF6B00;
            padding: 10px 14px;
            margin-bottom: 16px;
            border-radius: 4px;
        }
        .total-amount {
            font-size: 16px;
            font-weight: bold;
            color: #ea580c;
        }
        .legal-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px 12px;
            margin-bottom: 22px;
            font-size: 9.5px;
            color: #334155;
            border-radius: 4px;
            line-height: 1.5;
        }
        .signatures-table {
            width: 100%;
            margin-top: 15px;
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

    {{-- Document Title Banner --}}
    <div class="banner">
        <table style="width: 100%;">
            <tr>
                <td>
                    <div class="banner-title">سند ومستند اتفاقية سحب رصيد تمويل مهام لوجستية</div>
                    <div class="banner-meta">رقم الوثيقة: <strong>{{ $request->request_number }}</strong> | تاريخ الإصدار: <strong>{{ $request->created_at->format('Y-m-d') }}</strong></div>
                </td>
                <td style="text-align: left;">
                    <span style="background-color: #6320EE; color: #ffffff; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: bold;">
                        {{ $request->status === 'approved' ? 'معتمد رسمياً' : ($request->status === 'pending' ? 'قيد المراجعة' : $request->status) }}
                    </span>
                </td>
            </tr>
        </table>
    </div>

    {{-- Details Table --}}
    <table class="grid-table">
        <tr>
            <td class="lbl">اسم الشركة المستفيدة:</td>
            <td class="val"><strong>{{ $company->company_name }}</strong></td>
            <td class="lbl">رقم السجل التجاري:</td>
            <td class="val">{{ $company->cr_number ?? 'غير مسجل' }}</td>
        </tr>
        <tr>
            <td class="lbl">المفوض بالتوقيع:</td>
            <td class="val">{{ $company->contact_person ?? $company->user->name }}</td>
            <td class="lbl">البريد الإلكتروني:</td>
            <td class="val">{{ $company->contact_email ?? $company->user->email }}</td>
        </tr>
        <tr>
            <td class="lbl">عدد المهام الممولة:</td>
            <td class="val">{{ $request->number_of_tasks }} مهمة لوجستية</td>
            <td class="lbl">تاريخ استحقاق السداد:</td>
            <td class="val"><strong>{{ $request->due_date ? $request->due_date->format('Y-m-d') : 'يحدد عند الاعتماد النهائي' }}</strong></td>
        </tr>
    </table>

    {{-- Tasks Table --}}
    <div class="section-title">بيان المهام اللوجستية المشمولة بسند السحب الحالي:</div>
    <table class="tasks-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 25%;">رقم المهمة بالمنصة</th>
                <th style="width: 25%;">رقم مرجع الشركة</th>
                <th style="width: 25%;">تاريخ التمويل</th>
                <th style="width: 20%; text-align: left;">المبلغ (ر.س)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td><strong>{{ $item->task->task_number ?? '-' }}</strong></td>
                <td>{{ $item->task->external_task_id ?? '-' }}</td>
                <td>{{ $item->task->funded_at ? $item->task->funded_at->format('Y-m-d H:i') : '-' }}</td>
                <td style="font-weight: bold; text-align: left;">{{ number_format($item->task_funding_amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Total Box --}}
    <div class="total-card">
        <table style="width: 100%;">
            <tr>
                <td style="text-align: right; font-size: 13px; font-weight: bold; color: #9a3412;">
                    إجمالي المبلغ المعتمد لسحب رصيد التمويل:
                </td>
                <td style="text-align: left;">
                    <span class="total-amount">{{ number_format($request->requested_amount, 2) }} ر.س</span>
                </td>
            </tr>
        </table>
    </div>

    {{-- Legal Terms --}}
    <div class="legal-box">
        <strong>الإقرار القانوني والالتزام المالي:</strong><br>
        تقر شركة ({{ $company->company_name }}) ممثلة بمسؤولها المفوض بأن المبالغ الموضحة أعلاه تم سحبها من محفظة تمويل المهام اللوجستية وتُسجل كمديونية والتزام مالي واجب الأداء في ذمتها لصالح المنصة، وتتعهد بسدادها بالكامل في موعد الاستحقاق المذكور، ويعد هذا السند سنداً تنفيذياً إلكترونياً ملزماً لكافة أطرافه.
    </div>

    {{-- Signatures & Stamp --}}
    <table class="signatures-table">
        <tr>
            <td style="width: 48%; padding-left: 8px;">
                <div class="sig-box">
                    <div class="sig-title">توقيع وختم المفوض عن الشركة</div>
                    <div class="sig-status">
                        @if($request->company_signed_at)
                            ✓ تم التوقيع الرقمي في {{ $request->company_signed_at->format('Y-m-d H:i') }}
                        @else
                            بانتظار اعتماد المفوض
                        @endif
                    </div>
                </div>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%; padding-right: 8px;">
                <div class="sig-box">
                    <div class="sig-title">{{ $settings['pdf_stamp_title'] ?? 'الختم والتوقيع الرقمي المعتمد' }}</div>
                    <div class="sig-status">
                        @if($request->admin_signed_at)
                            ✓ تم الاعتماد والتوثيق في {{ $request->admin_signed_at->format('Y-m-d H:i') }}
                        @else
                            قيد المراجعة والاعتماد
                        @endif
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
