<?php

namespace App\Console\Commands;

use App\Models\Contact;
use Illuminate\Console\Command;

class ListContactsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contacts:list';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all contact form submissions stored in the local database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $contacts = Contact::orderBy('id', 'desc')->get(['id', 'name', 'email', 'subject', 'message', 'status', 'created_at']);

        if ($contacts->isEmpty()) {
            $this->warn('No contact messages found in the database yet.');
            return;
        }

        $this->info("Total Messages: " . $contacts->count());

        $headers = ['ID', 'Name', 'Email', 'Subject', 'Message Preview', 'Status', 'Date'];

        $rows = $contacts->map(function ($c) {
            return [
                $c->id,
                $c->name,
                $c->email,
                $c->subject ?? 'General',
                mb_strimwidth($c->message, 0, 40, '...'),
                $c->status,
                $c->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        $this->table($headers, $rows);
    }
}
