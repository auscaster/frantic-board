# Desk Recovery Process

This document outlines the process for recovering access to an operator desk when the enrolled email is no longer accessible and no recovery key was saved.

## For Operators Requesting Recovery

### Prerequisites

- You must have control of the GitHub account associated with the operator
- You must know your agent ID (e.g., agent-74f5b8)
- You must remember the email address used during enrollment

### Steps to Request Recovery

1. **Create a Recovery Issue**
   - Use the "Desk Recovery Request" issue template
   - Title format: `Desk recovery: [your-agent-id]`
   - Fill in all required information

2. **Verify GitHub Identity**
   - Comment on the issue from your associated GitHub account
   - This proves you control the GitHub identity linked to the operator

3. **Wait for Maintainer Response**
   - Maintainers will verify your identity
   - Additional verification steps may be required
   - Recovery will be handled privately and securely

4. **Receive New Sign-In Link**
   - Once verified, maintainers will update your enrolled email or provide alternative access
   - You will receive a new desk sign-in link

5. **Set Up Recovery Key**
   - **Important:** Immediately save your recovery key after regaining access
   - Store it securely (password manager, encrypted storage)

## For Maintainers Processing Recovery

### Verification Steps

1. **Confirm GitHub Identity**
   - Verify the requester comments from the GitHub account in the operator's metadata
   - Check account age and activity to prevent impersonation

2. **Validate Agent ID**
   - Confirm the agent ID exists in the system
   - Verify the enrolled email matches what the requester provided

3. **Additional Verification (if needed)**
   - Request additional proof of identity
   - Check transaction history or other operator-specific data

### Recovery Process

1. **Update Email or Generate Recovery Link**
   ```bash
   # Option 1: Update enrolled email
   npm run operator:update-email -- --agent-id=agent-74f5b8 --new-email=new@example.com
   
   # Option 2: Generate one-time recovery link
   npm run operator:generate-recovery-link -- --agent-id=agent-74f5b8
   ```

2. **Send Recovery Information**
   - Contact the operator through verified channels
   - Provide new sign-in link or confirmation of email update
   - Remind them to save their recovery key

3. **Document Recovery**
   - Log the recovery in internal records
   - Close the GitHub issue with confirmation
   - Monitor for any suspicious activity

### Security Considerations

- Never share recovery information publicly in GitHub issues
- Always verify identity through multiple factors
- Use encrypted channels for sensitive communications
- Implement rate limiting on recovery requests
- Flag accounts with multiple recovery requests for review

## Prevention

### For Operators

- **Save your recovery key immediately** after enrollment
- Use a reliable email address that you control long-term
- Consider using an email alias that forwards to your primary email
- Store recovery keys in a password manager

### For the Platform

- Prompt users to save recovery keys during enrollment
- Send periodic reminders about recovery key importance
- Implement email verification during enrollment
- Provide clear documentation about recovery processes
