# Compliance Pack

This runx skill performs compliance checks based on a set of rules.

## Usage

Provide a context object with the required fields (accessControl, encryption, auditLogging, patching).

## Rules

- **access-control**: Ensure access control is enabled.
- **data-encryption**: Verify encryption at rest and in transit.
- **audit-logging**: Ensure audit logging is enabled.
- **patching**: Check that systems are up-to-date.

## Testing

Run `npm test` to execute the test suite.