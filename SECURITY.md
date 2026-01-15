# Security Policy

## Reporting a Vulnerability

We take the security of Trammarise seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure

**DO NOT** report security vulnerabilities through public GitHub issues.

Instead, please report them privately by:

1. **Email**: Send details to the project maintainers (add your contact email here)
2. **GitHub Security Advisories**: Use the [Security tab](../../security/advisories/new) to report privately

### What to Include

When reporting a vulnerability, please include:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** (what could an attacker do?)
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (critical issues prioritized)

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

As this is an early-stage project, we currently only support the latest version. We recommend always using the most recent release.

## Security Best Practices for Users

### API Key Security

Trammarise handles API keys with the following security measures:

✅ **What We Do:**
- Store API keys in `sessionStorage` only (cleared when tab closes)
- Never save keys to disk, `localStorage`, or cloud
- Never log or echo API keys in responses
- Send keys directly to AI provider APIs (not stored on our servers)
- Use HTTPS for all API communications

⚠️ **What You Should Do:**
- **Set spending limits** on your AI provider accounts
- **Never commit API keys** to version control
- **Revoke keys immediately** if accidentally exposed
- **Use separate keys** for development and production
- **Rotate keys regularly** as a best practice

### Self-Hosting Security

If you're self-hosting Trammarise:

1. **Environment Variables**: Never commit `.env.local` files
2. **CORS Configuration**: Ensure proper CORS headers in production
3. **HTTPS**: Always use HTTPS in production (Vercel handles this automatically)
4. **Dependency Updates**: Regularly update dependencies with `npm audit fix`
5. **Access Control**: Implement authentication if deploying publicly

### Browser Security

Trammarise uses modern browser APIs that require specific security headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

These are configured in `vercel.json` and `vite.config.ts` for FFmpeg support.

## Known Security Considerations

### Client-Side Processing

- **Audio files** are processed in the browser using FFmpeg WASM
- **Large files** may consume significant memory
- **File uploads** are validated for type and size (max 100MB)

### Third-Party Dependencies

We regularly monitor and update dependencies for security vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Fix non-breaking vulnerabilities
npm audit fix

# Review breaking changes manually
npm audit fix --force
```

### API Provider Security

Trammarise integrates with third-party AI providers:

- **OpenAI** (Whisper, GPT-4)
- **Anthropic** (Claude)
- **OpenRouter** (multiple models)

**Your API keys** are sent directly to these providers. Review their security policies:
- [OpenAI Security](https://platform.openai.com/docs/guides/safety-best-practices)
- [Anthropic Security](https://docs.anthropic.com/claude/docs/security)
- [OpenRouter Security](https://openrouter.ai/docs/security)

## Security Updates

When a security vulnerability is fixed:

1. **Patch Release**: We'll release a patch version (e.g., 0.1.1)
2. **Security Advisory**: Published on GitHub Security Advisories
3. **Changelog**: Documented in `CHANGELOG.md`
4. **Notification**: Users notified via GitHub releases

## Vulnerability Disclosure Policy

We follow **responsible disclosure**:

1. **Report received** → Acknowledge within 48 hours
2. **Vulnerability confirmed** → Begin working on fix
3. **Fix developed** → Test thoroughly
4. **Patch released** → Publish security advisory
5. **Public disclosure** → After users have time to update (typically 7-14 days)

## Security Checklist for Contributors

When contributing code, ensure:

- [ ] No hardcoded API keys or secrets
- [ ] Input validation for user-provided data
- [ ] Proper error handling (no sensitive data in error messages)
- [ ] Dependencies are up-to-date (`npm audit` passes)
- [ ] No XSS vulnerabilities (use React's built-in escaping)
- [ ] Proper CORS configuration for API routes
- [ ] Secure session storage (no sensitive data in localStorage)

## Contact

For security-related questions or concerns:

- **Security Issues**: Use private disclosure methods above
- **General Security Questions**: Open a GitHub Discussion
- **Urgent Security Matters**: Email maintainers directly

---

**Thank you for helping keep Trammarise secure!** 🔒
