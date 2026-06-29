# Unsafe Private URL And Email

This synthetic fixture should fail redaction review.

- Private URL: `https://internal.example.invalid/tickets/123?token=SYNTHETIC_SECRET_DO_NOT_USE_url_token`
- Private email: `user@example.invalid`
- Expected reviewer action: reject and require `[PRIVATE_URL]` plus `[PRIVATE_EMAIL]`.

No real credential, real customer data, or routable private service appears here.
