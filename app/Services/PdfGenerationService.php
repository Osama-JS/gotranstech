<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\SystemSetting;
use App\Models\WithdrawalRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PdfGenerationService
{
    /**
     * Get all PDF branding and print configuration settings.
     */
    public function getBrandingSettings(): array
    {
        $settings = SystemSetting::where('group', 'pdf_branding')->get()->pluck('value', 'key')->toArray();

        return array_merge([
            'pdf_header_org_name' => 'منصة GoTransTech للتمويل اللوجستي',
            'pdf_header_subtitle' => 'المملكة العربية السعودية - سجل تجاري رقم 1010889922 - مرخصة من الهيئة العامة للنقل',
            'pdf_header_tax_number' => 'الرقم الضريبي: 310298374600003',
            'pdf_footer_legal_text' => 'وثيقة إلكترونية رسمية صادرة من منصة GoTransTech بموجب نظام التعاملات الإلكترونية السعودي وتعتبر حجة ملزمة لكافة أطرافها.',
            'pdf_stamp_title' => 'الختم والتوقيع الرقمي المعتمد - منصة GoTransTech',
            'pdf_watermark_text' => 'GoTransTech',
            'pdf_show_watermark' => '1',
            'pdf_print_logo' => '',
        ], $settings);
    }

    /**
     * Get platform logo as base64 string for DomPDF.
     */
    public function getLogoBase64(?string $customLogoPath = null): ?string
    {
        $logoPath = $customLogoPath ?: EncryptedSettingService::get('pdf_print_logo') ?: EncryptedSettingService::get('platform_logo');

        if (!$logoPath) {
            return null;
        }

        // Clean path from URL or /storage/
        $cleanPath = ltrim(str_replace('/storage/', '', $logoPath), '/');

        if (Storage::disk('public')->exists($cleanPath)) {
            $content = Storage::disk('public')->get($cleanPath);
            $mime = Storage::disk('public')->mimeType($cleanPath) ?: 'image/jpeg';
            return 'data:' . $mime . ';base64,' . base64_encode($content);
        }

        if (file_exists(public_path($cleanPath))) {
            $content = file_get_contents(public_path($cleanPath));
            $ext = pathinfo($cleanPath, PATHINFO_EXTENSION);
            return 'data:image/' . ($ext ?: 'png') . ';base64,' . base64_encode($content);
        }

        return null;
    }

    /**
     * Generate official Arabic PDF withdrawal agreement document.
     */
    public function generateWithdrawalPdf(WithdrawalRequest $request): string
    {
        $request->load(['company.user', 'items.task']);
        $settings = $this->getBrandingSettings();
        $logoBase64 = $this->getLogoBase64($settings['pdf_print_logo'] ?? null);

        // Render blade view
        $rawHtml = view('pdf.withdrawal_agreement', [
            'request' => $request,
            'company' => $request->company,
            'items' => $request->items,
            'settings' => $settings,
            'logoBase64' => $logoBase64,
            'generatedAt' => now()->format('Y-m-d H:i'),
        ])->render();

        // Reshape Arabic glyphs and order
        $shapedHtml = ArabicPdfHelper::reshapeHtml($rawHtml);

        $pdf = Pdf::loadHTML($shapedHtml)
            ->setPaper('a4', 'portrait')
            ->setOption([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'DejaVu Sans',
            ]);

        $fileName = 'withdrawals/' . $request->request_number . '.pdf';
        Storage::disk('public')->put($fileName, $pdf->output());

        $request->pdf_file_path = $fileName;
        $request->save();

        return $fileName;
    }

    /**
     * Generate official Arabic PDF contract document.
     */
    public function generateContractPdf(Contract $contract): string
    {
        $contract->load(['user', 'signer']);
        $settings = $this->getBrandingSettings();
        $logoBase64 = $this->getLogoBase64($settings['pdf_print_logo'] ?? null);

        $rawHtml = view('pdf.contract_document', [
            'contract' => $contract,
            'settings' => $settings,
            'logoBase64' => $logoBase64,
            'generatedAt' => now()->format('Y-m-d H:i'),
        ])->render();

        $shapedHtml = ArabicPdfHelper::reshapeHtml($rawHtml);

        $pdf = Pdf::loadHTML($shapedHtml)
            ->setPaper('a4', 'portrait')
            ->setOption([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'DejaVu Sans',
            ]);

        $fileName = 'contracts/' . $contract->contract_number . '.pdf';
        Storage::disk('public')->put($fileName, $pdf->output());

        $contract->file_path = $fileName;
        $contract->save();

        return $fileName;
    }
}
