<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FormField;
use App\Models\FormTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminFormTemplateController extends Controller
{
    public function index(): Response
    {
        $templates = FormTemplate::with(['fields' => function ($q) {
            $q->orderBy('order', 'asc');
        }])
        ->withCount('users')
        ->latest()
        ->get();

        return Inertia::render('Admin/FormTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'applies_to' => 'required|in:investor,company,all',
            'is_active' => 'boolean',
            'fields' => 'nullable|array',
            'fields.*.name' => 'required|string|max:100',
            'fields.*.label' => 'required|string|max:255',
            'fields.*.type' => 'required|in:text,number,select,date,file,textarea,checkbox',
            'fields.*.options' => 'nullable|array',
            'fields.*.is_required' => 'boolean',
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.order' => 'nullable|integer',
        ]);

        $template = FormTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'applies_to' => $validated['applies_to'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (!empty($validated['fields'])) {
            foreach ($validated['fields'] as $index => $fieldData) {
                FormField::create([
                    'form_template_id' => $template->id,
                    'name' => $fieldData['name'],
                    'label' => $fieldData['label'],
                    'type' => $fieldData['type'],
                    'options' => $fieldData['options'] ?? null,
                    'is_required' => $fieldData['is_required'] ?? false,
                    'placeholder' => $fieldData['placeholder'] ?? null,
                    'order' => $fieldData['order'] ?? $index,
                    'is_active' => true,
                ]);
            }
        }

        return back()->with('success', 'تم إنشاء قالب الحقول الإضافية بنجاح.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $template = FormTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'applies_to' => 'required|in:investor,company,all',
            'is_active' => 'boolean',
            'fields' => 'nullable|array',
            'fields.*.id' => 'nullable|integer',
            'fields.*.name' => 'required|string|max:100',
            'fields.*.label' => 'required|string|max:255',
            'fields.*.type' => 'required|in:text,number,select,date,file,textarea,checkbox',
            'fields.*.options' => 'nullable|array',
            'fields.*.is_required' => 'boolean',
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.order' => 'nullable|integer',
        ]);

        $template->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'applies_to' => $validated['applies_to'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Sync fields
        $keepIds = [];
        if (!empty($validated['fields'])) {
            foreach ($validated['fields'] as $index => $fieldData) {
                if (!empty($fieldData['id'])) {
                    $field = FormField::where('form_template_id', $template->id)->find($fieldData['id']);
                    if ($field) {
                        $field->update([
                            'name' => $fieldData['name'],
                            'label' => $fieldData['label'],
                            'type' => $fieldData['type'],
                            'options' => $fieldData['options'] ?? null,
                            'is_required' => $fieldData['is_required'] ?? false,
                            'placeholder' => $fieldData['placeholder'] ?? null,
                            'order' => $fieldData['order'] ?? $index,
                        ]);
                        $keepIds[] = $field->id;
                    }
                } else {
                    $newField = FormField::create([
                        'form_template_id' => $template->id,
                        'name' => $fieldData['name'],
                        'label' => $fieldData['label'],
                        'type' => $fieldData['type'],
                        'options' => $fieldData['options'] ?? null,
                        'is_required' => $fieldData['is_required'] ?? false,
                        'placeholder' => $fieldData['placeholder'] ?? null,
                        'order' => $fieldData['order'] ?? $index,
                        'is_active' => true,
                    ]);
                    $keepIds[] = $newField->id;
                }
            }
        }

        // Delete removed fields
        FormField::where('form_template_id', $template->id)
            ->whereNotIn('id', $keepIds)
            ->delete();

        return back()->with('success', 'تم تحديث قالب الحقول الإضافية والحقول المرتبطة بنجاح.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $template = FormTemplate::findOrFail($id);
        $template->delete();

        return back()->with('success', 'تم حذف قالب الحقول الإضافية بنجاح.');
    }
}
