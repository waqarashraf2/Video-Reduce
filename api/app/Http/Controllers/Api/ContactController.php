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
            // 1. Save submission to Database
            $contact = Contact::create([
                'name' => strip_tags(trim($validated['name'])),
                'email' => strtolower(trim($validated['email'])),
                'subject' => !empty($validated['subject']) ? strip_tags(trim($validated['subject'])) : 'General Inquiry',
                'message' => strip_tags(trim($validated['message'])),
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'status' => 'unread',
            ]);

            // 2. Dispatch Email Notification safely
            $recipientEmail = env('ADMIN_NOTIFICATION_EMAIL', env('MAIL_TO_ADDRESS', config('mail.from.address')));

            if (!empty($recipientEmail)) {
                try {
                    Mail::to($recipientEmail)->send(new ContactMessageReceived($contact));
                } catch (\Throwable $mailException) {
                    // Log email error so form submission is not lost if mail server is temporarily down
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
                    'created_at' => $contact->created_at?->toISOString(),
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
