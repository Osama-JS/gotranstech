import React, { useRef, useState, useEffect } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignRight,
    AlignCenter,
    AlignLeft,
    AlignJustify,
    List,
    ListOrdered,
    Table as TableIcon,
    Link as LinkIcon,
    Image as ImageIcon,
    Quote,
    Minus,
    RemoveFormatting,
    Code,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
    Plus,
    Trash2
} from 'lucide-react';

export default function RichTextEditor({
    value = '',
    onChange,
    label = '',
    error = '',
    placeholder = 'اكتب بنود وشروط العقد هنا...',
    className = '',
}) {
    const editorRef = useRef(null);
    const [htmlMode, setHtmlMode] = useState(false);
    const [sourceCode, setSourceCode] = useState(value);
    const [wordCount, setWordCount] = useState(0);

    // Sync external value with editor on mount or external reset
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
            updateWordCount(value || '');
        }
    }, [value]);

    const updateWordCount = (html) => {
        const text = html.replace(/<[^>]*>/g, '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        setWordCount(words);
    };

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            setSourceCode(html);
            updateWordCount(html);
            if (onChange) onChange(html);
        }
    };

    const exec = (command, val = null) => {
        if (htmlMode) return;
        document.execCommand(command, false, val);
        if (editorRef.current) {
            editorRef.current.focus();
            handleInput();
        }
    };

    // Table Insertion
    const insertTable = () => {
        const rows = prompt('أدخل عدد الصفوف:', '3');
        const cols = prompt('أدخل عدد الأعمدة:', '3');
        if (!rows || !cols) return;

        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0;"><thead><tr>';
        for (let c = 1; c <= cols; c++) {
            tableHtml += `<th style="border: 1px solid #94a3b8; background-color: #f1f5f9; color: #0f172a; padding: 8px; font-weight: bold; text-align: right;">عنوان ${c}</th>`;
        }
        tableHtml += '</tr></thead><tbody>';
        for (let r = 1; r <= rows; r++) {
            tableHtml += '<tr>';
            for (let c = 1; c <= cols; c++) {
                tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">خلية ${r}-${c}</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p><br></p>';

        exec('insertHTML', tableHtml);
    };

    // Link Insertion
    const insertLink = () => {
        const url = prompt('أدخل رابط الـ URL:', 'https://');
        if (url) {
            exec('createLink', url);
        }
    };

    // Image Insertion
    const insertImage = () => {
        const url = prompt('أدخل رابط الصورة (URL) أو base64:', 'https://');
        if (url) {
            const imgHtml = `<img src="${url}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; border: 1px solid #cbd5e1;" alt="مرفق العقد" /><p><br></p>`;
            exec('insertHTML', imgHtml);
        }
    };

    // Blockquote clause
    const insertClauseBox = () => {
        const boxHtml = `
            <blockquote style="border-right: 4px solid #6320EE; background-color: #f5f3ff; color: #3b0764; padding: 10px 14px; margin: 12px 0; border-radius: 4px;">
                <strong>بند خاص / التزام قانوني:</strong> اكتب نص الشرط أو الالتزام هنا...
            </blockquote><p><br></p>
        `;
        exec('insertHTML', boxHtml);
    };

    const toggleHtmlMode = () => {
        if (htmlMode) {
            // Apply source code back to visual editor
            if (editorRef.current) {
                editorRef.current.innerHTML = sourceCode;
            }
            if (onChange) onChange(sourceCode);
            setHtmlMode(false);
        } else {
            // Switch to raw source code
            if (editorRef.current) {
                setSourceCode(editorRef.current.innerHTML);
            }
            setHtmlMode(true);
        }
    };

    const handleSourceCodeChange = (e) => {
        const val = e.target.value;
        setSourceCode(val);
        updateWordCount(val);
        if (onChange) onChange(val);
    };

    return (
        <div className={`space-y-1.5 ${className}`} dir="rtl">
            {label && (
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}

            <div className="border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 focus-within:border-violet-500 transition-all shadow-sm">
                {/* Modern Toolbar */}
                <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 flex flex-wrap items-center gap-1 select-none">
                    {/* Headings */}
                    <button
                        type="button"
                        onClick={() => exec('formatBlock', '<h1>')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="عنوان رئيسي (H1)"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('formatBlock', '<h2>')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="عنوان فرعي (H2)"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('formatBlock', '<p>')}
                        className="p-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="نص عادي"
                    >
                        نص
                    </button>

                    <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Basic Styling */}
                    <button
                        type="button"
                        onClick={() => exec('bold')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="غامق (Ctrl+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('italic')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="مائل (Ctrl+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('underline')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="تسطير (Ctrl+U)"
                    >
                        <Underline className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('strikeThrough')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="يتوسطه خط"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>

                    <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Alignments */}
                    <button
                        type="button"
                        onClick={() => exec('justifyRight')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="محاذاة لليمين"
                    >
                        <AlignRight className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyCenter')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="محاذاة للوسط"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyLeft')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="محاذاة لليسار"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyFull')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="ضبط النص كلياً"
                    >
                        <AlignJustify className="w-4 h-4" />
                    </button>

                    <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Lists */}
                    <button
                        type="button"
                        onClick={() => exec('insertUnorderedList')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="قائمة نقطية"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('insertOrderedList')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="قائمة رقمية"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>

                    <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Rich Objects: Tables, Links, Images, Clauses */}
                    <button
                        type="button"
                        onClick={insertTable}
                        className="p-1.5 rounded-lg text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors flex items-center gap-1 font-bold text-xs"
                        title="إدراج جدول"
                    >
                        <TableIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">جدول</span>
                    </button>
                    <button
                        type="button"
                        onClick={insertLink}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="إدراج رابط"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={insertImage}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="إدراج صورة"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={insertClauseBox}
                        className="p-1.5 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors flex items-center gap-1 text-xs font-bold"
                        title="إدراج صندوق بند قانوني مميز"
                    >
                        <Quote className="w-4 h-4" />
                        <span className="hidden sm:inline">بند قانوني</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('insertHorizontalRule')}
                        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="فاصل أفقي"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Formatting cleanup & HTML source */}
                    <button
                        type="button"
                        onClick={() => exec('removeFormat')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="مسح التنسيق"
                    >
                        <RemoveFormatting className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={toggleHtmlMode}
                        className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
                            htmlMode
                                ? 'bg-[#6320EE] text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                        title="عرض وتعديل كود الـ HTML"
                    >
                        <Code className="w-4 h-4" />
                        <span>HTML</span>
                    </button>
                </div>

                {/* Editor Surface */}
                {htmlMode ? (
                    <textarea
                        value={sourceCode}
                        onChange={handleSourceCodeChange}
                        className="w-full h-72 p-4 bg-slate-900 text-slate-100 font-mono text-xs focus:outline-none resize-y"
                        dir="ltr"
                    />
                ) : (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onBlur={handleInput}
                        data-placeholder={placeholder}
                        className="p-4 min-h-[220px] max-h-[500px] overflow-y-auto text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
                    />
                )}

                {/* Footer Count Bar */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 px-4 py-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between select-none">
                    <span>محرر العقود والاتفاقيات المتقدم</span>
                    <span>عدد الكلمات: <strong className="font-mono text-violet-600 dark:text-violet-400">{wordCount}</strong></span>
                </div>
            </div>

            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>
    );
}
