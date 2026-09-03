<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Submission</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0b0f19;
            color: #e2e8f0;
            margin: 0;
            padding: 24px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #111827;
            border-radius: 16px;
            border: 1px solid #1f2937;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }
        .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 20px;
            margin: 0;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            color: #93c5fd;
            font-size: 13px;
            margin: 6px 0 0 0;
        }
        .content {
            padding: 24px;
        }
        .field {
            margin-bottom: 18px;
        }
        .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
            margin-bottom: 4px;
            font-weight: 600;
        }
        .value {
            font-size: 14px;
            color: #f8fafc;
            background-color: #1f2937;
            padding: 10px 14px;
            border-radius: 8px;
            border: 1px solid #374151;
            word-break: break-word;
        }
        .message-box {
            font-size: 14px;
            line-height: 1.6;
            color: #f8fafc;
            background-color: #1e293b;
            padding: 16px;
            border-radius: 10px;
            border-left: 4px solid #3b82f6;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .meta-table {
            width: 100%;
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #1f2937;
            font-size: 12px;
            color: #64748b;
        }
        .meta-table td {
            padding: 4px 0;
        }
        .footer {
            background-color: #0b0f19;
            padding: 16px 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #1f2937;
        }
        .reply-button {
            display: inline-block;
            margin-top: 16px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VideoReduce Support & Contact</h1>
            <p>You received a new visitor inquiry</p>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Sender Name</div>
                <div class="value">{{ $contact->name }}</div>
            </div>

            <div class="field">
                <div class="label">Email Address</div>
                <div class="value"><a href="mailto:{{ $contact->email }}" style="color: #60a5fa; text-decoration: none;">{{ $contact->email }}</a></div>
            </div>

            <div class="field">
                <div class="label">Subject / Category</div>
                <div class="value">{{ $contact->subject ?? 'General Feedback' }}</div>
            </div>

            <div class="field">
                <div class="label">Message</div>
                <div class="message-box">{{ $contact->message }}</div>
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <a href="mailto:{{ $contact->email }}?subject=Re: {{ urlencode($contact->subject ?? 'Your inquiry at VideoReduce') }}" class="reply-button">
                    Reply to {{ $contact->name }}
                </a>
            </div>

            <table class="meta-table">
                <tr>
                    <td><strong>Submission Time:</strong></td>
                    <td style="text-align: right;">{{ $contact->created_at ? $contact->created_at->format('M d, Y h:i A T') : now()->format('M d, Y h:i A T') }}</td>
                </tr>
                @if($contact->ip_address)
                <tr>
                    <td><strong>IP Address:</strong></td>
                    <td style="text-align: right;">{{ $contact->ip_address }}</td>
                </tr>
                @endif
            </table>
        </div>
        <div class="footer">
            Sent automatically by VideoReduce API backend notification service.
        </div>
    </div>
</body>
</html>
