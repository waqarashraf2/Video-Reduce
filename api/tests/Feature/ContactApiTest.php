<?php

namespace Tests\Feature;

use App\Mail\ContactMessageReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test health check endpoint.
     */
    public function test_health_check_returns_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'service' => 'VideoReduce API',
            ]);
    }

    /**
     * Test contact submission with valid data.
     */
    public function test_contact_form_submits_successfully_and_saves_to_database(): void
    {
        Mail::fake();

        $payload = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'Feature Request',
            'message' => 'Please add MKV compression support.',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Thank you! Your message has been received and saved.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'created_at'],
            ]);

        $this->assertDatabaseHas('contacts', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'Feature Request',
            'message' => 'Please add MKV compression support.',
        ]);

        Mail::assertSent(ContactMessageReceived::class);
    }

    /**
     * Test validation failure with invalid data.
     */
    public function test_contact_form_validation_fails_with_invalid_email(): void
    {
        $payload = [
            'name' => 'John',
            'email' => 'invalid-email-address',
            'subject' => 'Help',
            'message' => 'Hi',
        ];

        $response = $this->postJson('/api/contact', $payload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ])
            ->assertJsonValidationErrors(['email', 'message']);
    }
}
