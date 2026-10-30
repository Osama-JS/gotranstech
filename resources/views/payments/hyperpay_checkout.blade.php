<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>بوابة الدفع الآمنة - شحن المحفظة الاستثمارية | Go-Tech</title>
    
    <!-- Google Fonts: Cairo -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <style>
        :root {
            --primary: #6320EE;
            --primary-hover: #5217D4;
            --primary-light: #7c3aed;
            --bg: #090d16;
            --card-bg: #0f172a;
            --card-border: rgba(255, 255, 255, 0.1);
            --inner-bg: #090d16;
            --inner-border: rgba(255, 255, 255, 0.08);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent-green: #10b981;
            --accent-amber: #f59e0b;
            --accent-red: #ef4444;
        }

        /* Complete shadow-free reset for a flat modern look */
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Cairo', sans-serif;
            -webkit-tap-highlight-color: transparent;
            box-shadow: none !important;
            -webkit-box-shadow: none !important;
            text-shadow: none !important;
        }

        body {
            background-color: var(--bg);
            background-image: 
                radial-gradient(at 0% 0%, rgba(99, 32, 238, 0.08) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 50%);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
        }

        .checkout-wrapper {
            width: 100%;
            max-width: 520px;
            animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .brand-header {
            text-align: center;
            margin-bottom: 22px;
        }

        .brand-logo-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(99, 32, 238, 0.12);
            border: 1px solid rgba(99, 32, 238, 0.3);
            padding: 6px 16px;
            border-radius: 9999px;
            margin-bottom: 12px;
        }

        .brand-logo-badge i {
            color: var(--primary-light);
            font-size: 1rem;
        }

        .brand-logo-badge span {
            font-weight: 800;
            font-size: 0.88rem;
            letter-spacing: 0.4px;
            color: #fff;
        }

        .page-title {
            font-size: 1.35rem;
            font-weight: 800;
            color: #fff;
            margin-bottom: 4px;
        }

        .page-subtitle {
            font-size: 0.82rem;
            color: var(--text-muted);
        }

        /* Main Flat Card - Crisp Border, Zero Box-Shadow */
        .glass-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 26px;
            margin-bottom: 20px;
            position: relative;
        }

        /* Order Summary Box */
        .order-summary {
            background: var(--inner-bg);
            border: 1px solid var(--inner-border);
            border-radius: 16px;
            padding: 18px;
            margin-bottom: 20px;
        }

        .amount-box {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            padding-bottom: 14px;
            margin-bottom: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .amount-label {
            font-size: 0.82rem;
            color: var(--text-muted);
            font-weight: 600;
        }

        .amount-value {
            font-size: 1.6rem;
            font-weight: 900;
            color: #fff;
        }

        .amount-value small {
            font-size: 0.88rem;
            font-weight: 700;
            color: var(--primary-light);
            margin-right: 4px;
        }

        .summary-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.82rem;
            margin-bottom: 10px;
        }

        .summary-row:last-child {
            margin-bottom: 0;
        }

        .summary-row .label {
            color: var(--text-muted);
        }

        .summary-row .val {
            color: #e2e8f0;
            font-weight: 600;
            direction: ltr;
        }

        /* Payment Brand Chip and Quick Switch */
        .brand-display-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .chip-brand {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.76rem;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 8px;
            direction: rtl;
        }

        .chip-brand.mada {
            background: rgba(0, 132, 89, 0.15);
            color: #34d399;
            border: 1px solid rgba(0, 132, 89, 0.4);
        }

        .chip-brand.card {
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .chip-brand.apple {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .btn-change-brand {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: var(--text-muted);
            font-size: 0.72rem;
            font-weight: 600;
            text-decoration: none;
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.03);
            transition: all 0.2s ease;
        }

        .btn-change-brand:hover {
            color: #fff;
            border-color: rgba(99, 32, 238, 0.5);
            background: rgba(99, 32, 238, 0.15);
        }

        /* Timer Banner */
        .timer-banner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.25);
            border-radius: 12px;
            padding: 10px 14px;
            margin-bottom: 20px;
            font-size: 0.8rem;
            color: #fde68a;
        }

        .timer-banner i {
            margin-left: 6px;
        }

        .countdown-digits {
            font-family: monospace;
            font-weight: 800;
            font-size: 0.95rem;
            direction: ltr;
            color: #fff;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 2px 8px;
            border-radius: 6px;
        }

        /* HyperPay Widget Customization - Strict Flat Minimal */
        .wpwl-container {
            direction: ltr !important;
            margin: 0 auto !important;
            max-width: 100% !important;
        }

        .wpwl-form {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
        }

        .wpwl-label {
            color: var(--text-muted) !important;
            font-family: 'Cairo', sans-serif !important;
            font-size: 0.78rem !important;
            font-weight: 600 !important;
            margin-bottom: 6px !important;
            letter-spacing: 0.2px !important;
        }

        .wpwl-control {
            background: rgba(9, 13, 22, 0.85) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            color: #fff !important;
            border-radius: 10px !important;
            padding: 12px 14px !important;
            height: 46px !important;
            font-size: 0.92rem !important;
            transition: border-color 0.15s ease, background-color 0.15s ease !important;
        }

        .wpwl-control:focus {
            border-color: var(--primary) !important;
            outline: 1.5px solid var(--primary) !important;
            outline-offset: 0 !important;
            background: rgba(9, 13, 22, 0.98) !important;
        }

        .wpwl-group {
            margin-bottom: 14px !important;
        }

        .wpwl-button-pay {
            background: var(--primary) !important;
            border: 1px solid var(--primary-light) !important;
            border-radius: 12px !important;
            padding: 13px !important;
            font-family: 'Cairo', sans-serif !important;
            font-weight: 800 !important;
            font-size: 1rem !important;
            cursor: pointer !important;
            width: 100% !important;
            margin-top: 10px !important;
            transition: background 0.15s ease, border-color 0.15s ease !important;
            color: #fff !important;
        }

        .wpwl-button-pay:hover {
            background: var(--primary-hover) !important;
            border-color: var(--primary) !important;
        }

        /* Mock Mode Card */
        .mock-container {
            text-align: center;
            padding: 14px 6px;
        }

        .mock-badge {
            display: inline-block;
            background: rgba(59, 130, 246, 0.12);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            font-size: 0.78rem;
            font-weight: 700;
            padding: 4px 10px;
            margin-bottom: 12px;
        }

        .mock-desc {
            font-size: 0.85rem;
            color: #cbd5e1;
            margin-bottom: 18px;
            line-height: 1.6;
        }

        .btn-confirm-mock {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            background: #10b981;
            color: #fff;
            border: 1px solid #059669;
            border-radius: 12px;
            padding: 13px;
            font-size: 0.95rem;
            font-weight: 800;
            cursor: pointer;
            text-decoration: none;
            transition: background 0.15s ease, border-color 0.15s ease;
        }

        .btn-confirm-mock:hover {
            background: #059669;
            border-color: #047857;
        }

        /* Action Buttons */
        .cancel-box {
            text-align: center;
            margin-top: 18px;
        }

        .btn-cancel {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: var(--text-muted);
            font-size: 0.82rem;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.15s ease;
        }

        .btn-cancel:hover {
            color: #fff;
        }

        /* Security Badges Footer */
        .security-footer {
            text-align: center;
            padding: 0 10px;
        }

        .security-tags {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }

        .security-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.72rem;
            color: #94a3b8;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            padding: 4px 10px;
            border-radius: 8px;
        }

        .security-tag i {
            color: var(--accent-green);
        }

        .security-note {
            font-size: 0.7rem;
            color: #64748b;
        }
    </style>
</head>
<body>

<div class="checkout-wrapper">
    <!-- Brand Header -->
    <div class="brand-header">
        <div class="brand-logo-badge">
            <i class="fa-solid fa-bolt"></i>
            <span>GoTransTech FinTech</span>
        </div>
        <h1 class="page-title">إتمام شحن المحفظة الاستثمارية</h1>
        <p class="page-subtitle">جلسة دفع مشفرة وآمنة بنظام التوثيق المصرفي المباشر</p>
    </div>

    <!-- Main Payment Card -->
    <div class="glass-card">
        <!-- Order Summary -->
        <div class="order-summary">
            <div class="amount-box">
                <span class="amount-label">المبلغ المراد شحنه</span>
                <span class="amount-value">
                    {{ number_format($transaction->amount, 2) }}
                    <small>ر.س</small>
                </span>
            </div>

            <div class="summary-row">
                <span class="label">المستثمر</span>
                <span class="val">{{ $transaction->user->name }}</span>
            </div>

            <div class="summary-row">
                <span class="label">وسيلة الدفع</span>
                <div class="brand-display-badge">
                    @if(strtoupper($transaction->payment_brand) === 'MADA')
                        <span class="chip-brand mada"><i class="fa-solid fa-credit-card"></i> مدى (Mada)</span>
                    @elseif(strtoupper($transaction->payment_brand) === 'APPLEPAY')
                        <span class="chip-brand apple"><i class="fa-brands fa-apple"></i> Apple Pay</span>
                    @else
                        <span class="chip-brand card"><i class="fa-regular fa-credit-card"></i> فيزا / ماستركارد</span>
                    @endif
                    <a href="{{ route('investor.wallet.investment', ['deposit' => 'open']) }}" class="btn-change-brand" title="تغيير وسيلة الدفع">
                        <i class="fa-solid fa-pen-to-square"></i> تغيير
                    </a>
                </div>
            </div>

            <div class="summary-row">
                <span class="label">رقم مرجع المعاملة</span>
                <span class="val">{{ substr($transaction->checkout_id, 0, 16) }}...</span>
            </div>
        </div>

        <!-- Timer Banner (15 Minutes) -->
        <div class="timer-banner" id="timerBox">
            <div>
                <i class="fa-regular fa-clock"></i>
                <span>تنتهي مهلة جلسة الدفع خلال:</span>
            </div>
            <div class="countdown-digits" id="timerDigits">15:00</div>
        </div>

        @if($isMock)
            <!-- Mock / Simulation Mode View -->
            <div class="mock-container">
                <div class="mock-badge">
                    <i class="fa-solid fa-flask"></i> بيئة المحاكاة والاختبار (Sandbox Simulation)
                </div>
                <p class="mock-desc">
                    تعمل البوابة حالياً في وضع المحاكاة الداخلي للمنصة. يمكنك إتمام عملية الشحن التجريبي لقيد الرصيد فوراً في محفظة الاستثمار.
                </p>
                <a href="{{ route('payments.hyperpay.callback', ['id' => $transaction->checkout_id]) }}" class="btn-confirm-mock">
                    <i class="fa-solid fa-circle-check"></i>
                    <span>تأكيد عملية الدفع التجريبية (إيداع {{ number_format($transaction->amount, 2) }} ر.س)</span>
                </a>
            </div>
        @else
            <!-- HyperPay Real Official Payment Widget -->
            <div class="widget-wrapper">
                <script>
                    var wpwlOptions = {
                        locale: "ar",
                        style: "card",
                        labels: {
                            cardNumber: "رقم البطاقة",
                            cardHolder: "اسم حامل البطاقة (بالأحرف اللاتينية)",
                            expiryDate: "تاريخ الانتهاء (MM/YY)",
                            cvv: "رمز التحقق الأمني CVV"
                        }
                    };
                </script>
                <script src="{{ $scriptUrl }}" crossorigin="anonymous"></script>
                <form action="{{ route('payments.hyperpay.callback') }}" class="paymentWidgets" data-brands="{{ $brands }}"></form>
            </div>
        @endif

        <!-- Cancel Link -->
        <div class="cancel-box">
            <a href="{{ route('investor.wallet.investment') }}" class="btn-cancel">
                <i class="fa-solid fa-arrow-right"></i>
                <span>إلغاء العملية والعودة إلى المحفظة</span>
            </a>
        </div>
    </div>

    <!-- Security Footer Badges -->
    <div class="security-footer">
        <div class="security-tags">
            <div class="security-tag">
                <i class="fa-solid fa-shield-halved"></i>
                <span>PCI-DSS Level 1</span>
            </div>
            <div class="security-tag">
                <i class="fa-solid fa-lock"></i>
                <span>3D Secure 2.0 (OTP)</span>
            </div>
            <div class="security-tag">
                <i class="fa-solid fa-key"></i>
                <span>تشفير 256-Bit SSL</span>
            </div>
        </div>
        <p class="security-note">جميع العمليات المالية تتم وتُعالج وفق المعايير المصرفية للبنك المركزي السعودي (SAMA).</p>
    </div>
</div>

<script>
    // 15 Minutes Countdown Timer
    (function() {
        var secondsLeft = 15 * 60;
        var display = document.getElementById('timerDigits');
        var timerBox = document.getElementById('timerBox');

        var interval = setInterval(function() {
            secondsLeft--;
            if (secondsLeft <= 0) {
                clearInterval(interval);
                display.textContent = '00:00';
                timerBox.style.background = 'rgba(239, 68, 68, 0.15)';
                timerBox.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                timerBox.style.color = '#fca5a5';
                alert('انتهت مهلة جلسة الدفع، يرجى إعادة محاولة الشحن من المحفظة.');
                window.location.href = "{{ route('investor.wallet.investment') }}";
                return;
            }

            var minutes = Math.floor(secondsLeft / 60);
            var seconds = secondsLeft % 60;
            display.textContent = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }, 1000);
    })();
</script>

</body>
</html>
