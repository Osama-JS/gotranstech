<?php

namespace App\Services;

class ArabicPdfHelper
{
    /**
     * Map of Arabic characters to their presentation forms (isolated, final, initial, medial).
     */
    protected static array $chars = [
        'ء' => [0xFE80, 0xFE80, 0xFE80, 0xFE80, false],
        'آ' => [0xFE81, 0xFE82, 0xFE81, 0xFE82, false],
        'أ' => [0xFE83, 0xFE84, 0xFE83, 0xFE84, false],
        'ؤ' => [0xFE85, 0xFE86, 0xFE85, 0xFE86, false],
        'إ' => [0xFE87, 0xFE88, 0xFE87, 0xFE88, false],
        'ئ' => [0xFE89, 0xFE8A, 0xFE8B, 0xFE8C, true],
        'ا' => [0xFE8D, 0xFE8E, 0xFE8D, 0xFE8E, false],
        'ب' => [0xFE8F, 0xFE90, 0xFE91, 0xFE92, true],
        'ة' => [0xFE93, 0xFE94, 0xFE93, 0xFE94, false],
        'ت' => [0xFE95, 0xFE96, 0xFE97, 0xFE98, true],
        'ث' => [0xFE99, 0xFE9A, 0xFE9B, 0xFE9C, true],
        'ج' => [0xFE9D, 0xFE9E, 0xFE9F, 0xFEA0, true],
        'ح' => [0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4, true],
        'خ' => [0xFEA5, 0xFEA6, 0xFEA7, 0xFEA8, true],
        'د' => [0xFEA9, 0xFEAA, 0xFEA9, 0xFEAA, false],
        'ذ' => [0xFEAB, 0xFEAC, 0xFEAB, 0xFEAC, false],
        'ر' => [0xFEAD, 0xFEAE, 0xFEAD, 0xFEAE, false],
        'ز' => [0xFEAF, 0xFEB0, 0xFEAF, 0xFEB0, false],
        'س' => [0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4, true],
        'ش' => [0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8, true],
        'ص' => [0xFEB9, 0xFEBA, 0xFEBB, 0xFEBC, true],
        'ض' => [0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0, true],
        'ط' => [0xFEC1, 0xFEC2, 0xFEC3, 0xFEC4, true],
        'ظ' => [0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8, true],
        'ع' => [0xFEC9, 0xFECA, 0xFECB, 0xFECC, true],
        'غ' => [0xFECD, 0xFECE, 0xFECF, 0xFED0, true],
        'ف' => [0xFED1, 0xFED2, 0xFED3, 0xFED4, true],
        'ق' => [0xFED5, 0xFED6, 0xFED7, 0xFED8, true],
        'ك' => [0xFED9, 0xFEDA, 0xFEDB, 0xFEDC, true],
        'ل' => [0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0, true],
        'م' => [0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4, true],
        'ن' => [0xFEE5, 0xFEE6, 0xFEE7, 0xFEE8, true],
        'ه' => [0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC, true],
        'و' => [0xFEED, 0xFEEE, 0xFEED, 0xFEEE, false],
        'ى' => [0xFEEF, 0xFEF0, 0xFEEF, 0xFEF0, false],
        'ي' => [0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4, true],
    ];

    /**
     * Reshape plain text or mixed Arabic/Latin/numbers string.
     */
    public static function shapeText(string $text): string
    {
        if (empty($text) || !preg_match('/[\x{0600}-\x{06FF}]/u', $text)) {
            return $text;
        }

        // Split text by lines to preserve line breaks
        $lines = preg_split('/\r\n|\r|\n/', $text);
        $shapedLines = [];

        foreach ($lines as $line) {
            $shapedLines[] = self::shapeLine($line);
        }

        return implode("\n", $shapedLines);
    }

    /**
     * Reshape an individual line with BiDi token reordering.
     */
    protected static function shapeLine(string $line): string
    {
        if (trim($line) === '' || !preg_match('/[\x{0600}-\x{06FF}]/u', $line)) {
            return $line;
        }

        // Tokenize line into Arabic segments, Latin segments, numbers, symbols, spaces
        preg_match_all('/[\x{0600}-\x{06FF}]+|[a-zA-Z0-9\+\-\/\#\%\:\.\,\@\(\)\>\<]+|\s+|[^\s\w\x{0600}-\x{06FF}]+/u', $line, $matches);
        $tokens = $matches[0] ?? [];

        if (empty($tokens)) {
            return $line;
        }

        $shapedTokens = [];
        foreach ($tokens as $token) {
            if (preg_match('/[\x{0600}-\x{06FF}]/u', $token)) {
                // Shape Arabic token and reverse its glyphs for LTR rendering
                $shaped = self::shapeArabicWord($token);
                // Reverse characters in Arabic word
                $shapedTokens[] = self::mbStrrev($shaped);
            } else {
                // Keep Latin / Number token as-is
                $tokenFixed = strtr($token, [
                    '(' => ')',
                    ')' => '(',
                    '[' => ']',
                    ']' => '[',
                    '{' => '}',
                    '}' => '{',
                ]);
                $shapedTokens[] = $tokenFixed;
            }
        }

        // Reverse the order of tokens for the RTL line
        $reversedTokens = array_reverse($shapedTokens);

        return implode('', $reversedTokens);
    }

    /**
     * Connect Arabic letters in a word into their contextual forms.
     */
    protected static function shapeArabicWord(string $word): string
    {
        // Strip harakat (tashkeel)
        $cleanWord = preg_replace('/[\x{064B}-\x{065F}\x{0670}]/u', '', $word);
        $chars = preg_split('//u', $cleanWord, -1, PREG_SPLIT_NO_EMPTY);
        $len = count($chars);

        if ($len === 0) {
            return '';
        }

        // Handle Lam-Alef ligatures first
        $newChars = [];
        for ($i = 0; $i < $len; $i++) {
            $curr = $chars[$i];
            $next = $i + 1 < $len ? $chars[$i + 1] : null;

            if ($curr === 'ل' && in_array($next, ['ا', 'أ', 'إ', 'آ'], true)) {
                $ligature = match ($next) {
                    'آ' => ['لا_آ', 0xFEF5, 0xFEF6],
                    'أ' => ['لا_أ', 0xFEF7, 0xFEF8],
                    'إ' => ['لا_إ', 0xFEF9, 0xFEFA],
                    default => ['لا_ا', 0xFEFB, 0xFEFC],
                };
                $newChars[] = $ligature;
                $i++; // skip next alef
            } else {
                $newChars[] = $curr;
            }
        }

        $result = '';
        $count = count($newChars);

        for ($i = 0; $i < $count; $i++) {
            $item = $newChars[$i];

            // Ligature item
            if (is_array($item)) {
                $prevItem = $i > 0 ? $newChars[$i - 1] : null;
                $prevCanConnect = false;

                if ($prevItem !== null && is_string($prevItem) && isset(self::$chars[$prevItem])) {
                    $prevCanConnect = self::$chars[$prevItem][4]; // connects forward
                }

                $code = $prevCanConnect ? $item[2] : $item[1]; // final : isolated
                $result .= mb_chr($code, 'UTF-8');
                continue;
            }

            if (!isset(self::$chars[$item])) {
                $result .= $item;
                continue;
            }

            $info = self::$chars[$item];
            $prevItem = $i > 0 ? $newChars[$i - 1] : null;
            $nextItem = $i + 1 < $count ? $newChars[$i + 1] : null;

            $prevCanConnect = false;
            if ($prevItem !== null) {
                if (is_string($prevItem) && isset(self::$chars[$prevItem])) {
                    $prevCanConnect = self::$chars[$prevItem][4];
                }
            }

            $nextCanConnect = false;
            if ($nextItem !== null) {
                if (is_array($nextItem)) {
                    $nextCanConnect = true; // ligatures accept back connection
                } elseif (is_string($nextItem) && isset(self::$chars[$nextItem])) {
                    $nextCanConnect = true;
                }
            }

            // Determine position: isolated=0, final=1, initial=2, medial=3
            if ($prevCanConnect && $nextCanConnect && $info[4]) {
                $code = $info[3]; // medial
            } elseif ($prevCanConnect) {
                $code = $info[1]; // final
            } elseif ($nextCanConnect && $info[4]) {
                $code = $info[2]; // initial
            } else {
                $code = $info[0]; // isolated
            }

            $result .= mb_chr($code, 'UTF-8');
        }

        return $result;
    }

    /**
     * Reshape all Arabic text inside an HTML document while keeping tags intact.
     */
    public static function reshapeHtml(string $html): string
    {
        if (empty($html) || !preg_match('/[\x{0600}-\x{06FF}]/u', $html)) {
            return $html;
        }

        // Match content outside of <tags> and <style>
        return preg_replace_callback(
            '/(>)([^<]+)(<)/u',
            function ($matches) {
                $text = html_entity_decode($matches[2], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $shaped = self::shapeText($text);
                return $matches[1] . htmlspecialchars($shaped, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . $matches[3];
            },
            $html
        );
    }

    /**
     * Multibyte string reverse.
     */
    protected static function mbStrrev(string $string): string
    {
        $chars = preg_split('//u', $string, -1, PREG_SPLIT_NO_EMPTY);
        return implode('', array_reverse($chars));
    }
}
