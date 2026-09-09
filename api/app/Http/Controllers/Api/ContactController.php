<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageReceived;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Store a newly created contact message in database and send email notification.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email:rfc,filter', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:5', 'max:5000'],
        ], [
            'name.required' => 'Please provide your name.',
            'email.required' => 'A valid email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'message.required' => 'Please enter your message.',
            'message.min' => 'Your message must be at least 5 characters.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please check the entered information.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        try {
            // 1. Prepare Contact object in memory
            $contact = new Contact([
                'name' => strip_tags(trim($validated['name'])),
                'email' => strtolower(trim($validated['email'])),
                'subject' => !empty($validated['subject']) ? strip_tags(trim($validated['subject'])) : 'General Inquiry',
                'message' => strip_tags(trim($validated['message'])),
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'status' => 'unread',
            ]);

            // 2. Try saving to MySQL Database if PDO is available
            $saved = false;
            if (class_exists('PDO')) {
                try {
                    $contact->save();
                    $saved = true;
                } catch (\Throwable $dbException) {
                    Log::warning('Database save failed, falling back to file storage: ' . $dbException->getMessage());
                }
            }

            // 3. Fallback: Save to JSON storage if database driver is not available
            if (!$saved) {
                $storageDir = storage_path('app');
                if (!is_dir($storageDir)) {
                    mkdir($storageDir, 0775, true);
                }
                $storagePath = $storageDir . '/contacts.json';
                $existing = file_exists($storagePath) ? json_decode(file_get_contents($storagePath), true) ?: [] : [];
                $entry = $contact->toArray();
                $entry['id'] = count($existing) + 1;
                $entry['created_at'] = now()->toISOString();
                $existing[] = $entry;
                file_put_contents($storagePath, json_encode($existing, JSON_PRETTY_PRINT));
                $contact->id = $entry['id'];
                Log::info('Contact message saved to JSON storage successfully', ['email' => $contact->email]);
            }

            // 4. Dispatch Email Notification safely
            $recipientEmail = env('ADMIN_NOTIFICATION_EMAIL', env('MAIL_TO_ADDRESS', config('mail.from.address')));

            if (!empty($recipientEmail)) {
                try {
                    Mail::to($recipientEmail)->send(new ContactMessageReceived($contact));
                } catch (\Throwable $mailException) {
                    Log::warning('Contact email notification failed to dispatch: ' . $mailException->getMessage(), [
                        'contact_id' => $contact->id,
                        'email' => $contact->email,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Thank you! Your message has been received and saved.',
                'data' => [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'created_at' => $contact->created_at?->toISOString() ?? now()->toISOString(),
                ],
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Error saving contact submission: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred while saving your message. Please try again later.',
            ], 500);
        }
    }

    /**
     * Health check endpoint to verify backend API readiness.
     *
     * @return JsonResponse
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'service' => 'VideoReduce API',
        ]);
    }
}
