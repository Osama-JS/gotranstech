<?php

namespace App\Services;

use InvalidArgumentException;

class UrlSecurityValidator
{
    /**
     * List of blocked IP ranges (CIDR format) and reserved addresses.
     */
    protected static array $blockedSubnets = [
        '127.0.0.0/8',       // Loopback IPv4
        '10.0.0.0/8',        // RFC1918 Private LAN
        '172.16.0.0/12',     // RFC1918 Private LAN
        '192.168.0.0/16',    // RFC1918 Private LAN
        '169.254.0.0/16',    // Link-local / Cloud Metadata (AWS, GCP, Azure, DO)
        '0.0.0.0/8',         // Current network
        '100.64.0.0/10',     // Carrier-grade NAT
        '192.0.0.0/24',      // IETF Protocol Assignments
        '198.18.0.0/15',     // Benchmark testing
        '224.0.0.0/4',       // Multicast
        '240.0.0.0/4',       // Reserved
        '::1/128',           // Loopback IPv6
        'fc00::/7',          // Unique Local Address IPv6
        'fe80::/10',         // Link-local IPv6
    ];

    /**
     * Validate a Webhook URL to ensure it is not vulnerable to SSRF.
     *
     * @param string $url
     * @param bool $allowHttpInLocal
     * @return array [bool $isValid, string|null $errorMessage, string|null $resolvedIp]
     */
    public static function validateWebhookUrl(string $url, bool $allowHttpInLocal = true): array
    {
        $cleanUrl = trim($url);

        if (empty($cleanUrl)) {
            return [false, 'الرابط غير محدد أو فارغ.', null];
        }

        $parts = parse_url($cleanUrl);
        if (!$parts || !isset($parts['scheme']) || !isset($parts['host'])) {
            return [false, 'صيغة الرابط غير صالحة. يرجى إدخال عنوان URL كامل مع البروتوكول (مثال: https://api.yourdomain.com/webhook).', null];
        }

        $scheme = strtolower($parts['scheme']);
        $isLocal = app()->environment('local', 'testing');

        // Scheme enforcement: require https in production
        if ($scheme !== 'https') {
            if ($scheme === 'http') {
                if (!$allowHttpInLocal || !$isLocal) {
                    return [false, 'يجب استخدام بروتوكول مشفر آمن (HTTPS) فقط لحماية بيانات الإشعارات.', null];
                }
            } else {
                return [false, "البروتوكول المستخدم ({$scheme}) غير مدعوم أو غير آمن. يُسمح فقط بـ HTTPS.", null];
            }
        }

        $host = strtolower($parts['host']);

        // Check for disallowed hostnames
        if (in_array($host, ['localhost', '127.0.0.1', '::1', '0.0.0.0', 'metadata.google.internal', 'instance-data'])) {
            return [false, 'العنوان المدخل يشير إلى خادم داخلي محظور.', null];
        }

        // Port restriction: allow 80 (if local http), 443, 8443
        if (isset($parts['port'])) {
            $allowedPorts = [443, 8443];
            if ($isLocal && $scheme === 'http') {
                $allowedPorts[] = 80;
                $allowedPorts[] = 8000;
                $allowedPorts[] = 3000;
            }
            if (!in_array($parts['port'], $allowedPorts)) {
                return [false, "المنفذ ({$parts['port']}) غير مصرح به لاستقبال الـ Webhooks. يُسمح بالمنافذ القياسية الآمنة فقط (443).", null];
            }
        }

        // DNS resolution to IP addresses
        $ips = @gethostbynamel($host);
        if ($ips === false || empty($ips)) {
            // Check if host is direct IP
            if (filter_var($host, FILTER_VALIDATE_IP)) {
                $ips = [$host];
            } else {
                return [false, 'تعذر الوصول إلى اسم النطاق المحدد (DNS Resolution Failed). يرجى التأكد من صحة النطاق.', null];
            }
        }

        // Validate each resolved IP against blocked subnets
        foreach ($ips as $ip) {
            if (self::isBlockedIp($ip, $isLocal)) {
                return [false, 'عنوان الـ IP المستهدف يتبع لشبكة داخلية أو محظورة أمنياً لمنع هجمات تزوير الطلبات (SSRF).', $ip];
            }
        }

        return [true, null, $ips[0]];
    }

    /**
     * Check if an IP address belongs to any blocked or private CIDR subnet.
     */
    protected static function isBlockedIp(string $ip, bool $isLocal = false): bool
    {
        // Cloud Metadata IP is ALWAYS blocked under all circumstances (even locally)
        if ($ip === '169.254.169.254' || str_starts_with($ip, '169.254.')) {
            return true;
        }

        // In production, strictly block private/reserved IPs
        if (!$isLocal) {
            if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return true;
            }

            foreach (self::$blockedSubnets as $subnet) {
                if (self::ipMatchesCidr($ip, $subnet)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Determine if an IPv4 or IPv6 address is within a CIDR range.
     */
    protected static function ipMatchesCidr(string $ip, string $cidr): bool
    {
        if (!str_contains($cidr, '/')) {
            return $ip === $cidr;
        }

        [$subnet, $mask] = explode('/', $cidr, 2);

        // IPv4 checking
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && filter_var($subnet, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $ipLong = ip2long($ip);
            $subnetLong = ip2long($subnet);
            $maskInt = (int) $mask;
            if ($maskInt < 0 || $maskInt > 32) {
                return false;
            }
            $maskLong = -1 << (32 - $maskInt);
            return ($ipLong & $maskLong) === ($subnetLong & $maskLong);
        }

        // IPv6 checking
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) && filter_var($subnet, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $ipBin = inet_pton($ip);
            $subnetBin = inet_pton($subnet);
            $maskInt = (int) $mask;
            if ($ipBin === false || $subnetBin === false || $maskInt < 0 || $maskInt > 128) {
                return false;
            }

            $bytes = (int) ($maskInt / 8);
            $remainder = $maskInt % 8;

            if ($bytes > 0 && substr($ipBin, 0, $bytes) !== substr($subnetBin, 0, $bytes)) {
                return false;
            }

            if ($remainder > 0) {
                $maskByte = chr(255 << (8 - $remainder));
                if (($ipBin[$bytes] & $maskByte) !== ($subnetBin[$bytes] & $maskByte)) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }
}
