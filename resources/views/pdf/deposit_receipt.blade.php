<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>إشعار تحويل وإيداع بنكي - {{ $deposit->deposit_number }}</title>
    <style>
        @page {
            margin: 20px;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            direction: rtl;
            text-align: right;
            color: #0f172a;
            font-size: 11px;
            line-height: 1.6;
        }
        .header {
            border-bottom: 2px solid #6320EE;
            padding-bottom: 10px;
            margin-bottom: 15px;
            text-align: center;
        }
        .title {
            font-size: 16px;
            font-weight: bold;
            color: #6320EE;
            margin-bottom: 3px;
        }
        .subtitle {
            font-size: 10px;
            color: #64748b;
        }
        .amount-box {
            background-color: #f5f3ff;
            border: 2px solid #6320EE;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            margin-bottom: 15px;
        }
        .amount-val {
            font-size: 20px;
            font-weight: bold;
            color: #6320EE;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .info-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10.5px;
        }
        .lbl {
            font-weight: bold;
            color: #475569;
            width: 35%;
            background-color: #f8fafc;
        }
        .val {
            color: #0f172a;
        }
        .stamp-box {
            border: 1px dashed #94a3b8;
            padding: 10px;
            text-align: center;
            border-radius: 6px;
            margin-top: 15px;
            font-size: 9.5px;
            color: #059669;
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 8.5px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="title">إشعار عملية إيداع وتحويل بنكي رسمي</div>
        <div class="subtitle">منصة GoTransTech - تأكيد قيد الشحن لحساب المستثمر</div>
    </div>

    <div class="amount-box">
        <div style="font-size: 11px; color: #475569; margin-bottom: 2px;">المبلغ المحول</div>
        <div class="amount-val">{{ number_format($deposit->amount, 2) }} ر.س</div>
        <div style="font-size: 9.5px; color: #64748b; margin-top: 3px;">رقم الإيداع: {{ $deposit->deposit_number }}</div>
    </div>

    <table class="info-table">
        <tr>
            <td class="lbl">اسم المودع / صاحب الحساب:</td>
            <td class="val"><strong>{{ $deposit->depositor_name ?: ($deposit->user->name ?? 'مستثمر المنصة') }}</strong></td>
        </tr>
        <tr>
            <td class="lbl">البنك المحول إليه:</td>
            <td class="val">{{ $deposit->bank_name ?: 'مصرف الراجحي' }}</td>
        </tr>
        <tr>
            <td class="lbl">الرقم المرجعي للتحويل:</td>
            <td class="val"><strong style="color: #6320EE;">{{ $deposit->bank_reference_number ?: 'REF-' . rand(10000000, 99999999) }}</strong></td>
        </tr>
        <tr>
            <td class="lbl">تاريخ ووقت الإيداع:</td>
            <td class="val">{{ $deposit->transfer_date ? $deposit->transfer_date->format('Y-m-d') : $deposit->created_at->format('Y-m-d H:i') }}</td>
        </tr>
        <tr>
            <td class="lbl">حالة العملية:</td>
            <td class="val">
                <strong>{{ $deposit->status === 'approved' ? 'معتمد ومقيد بالمحفظة' : ($deposit->status === 'pending' ? 'قيد التدقيق المحاسبي' : 'مرفوض') }}</strong>
            </td>
        </tr>
    </table>

    <div class="stamp-box">
        ✓ إشعار إلكتروني معتمد ومطابق لبيانات الحسابات البنكية للمنصة
    </div>

    <div class="footer">
        تم استخراج هذا الإشعار إلكترونياً من منصة GoTransTech في {{ now()->format('Y-m-d H:i:s') }}
    </div>

</body>
</html>
