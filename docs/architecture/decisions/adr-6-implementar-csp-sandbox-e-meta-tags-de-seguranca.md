## Title
ADR-6: Implementar CSP Sandbox e Meta Tags de Segurança

## Context
The project requires protection against XSS attacks, clickjacking, and data leakage. Implementing a strong Content Security Policy (CSP), sandboxing iframes, and using security meta tags are essential steps.

## Decision
Implement the following security measures:
- Content Security Policy (CSP): Define and enforce a restrictive CSP to prevent XSS attacks.
- Iframe Sandboxing: Sandbox iframes and external windows to limit their capabilities.
- Security Meta Tags: Implement meta tags for protection against XSS, clickjacking, and data leakage.

## Alternatives Considered
1. No CSP.
2. No iframe sandboxing.
3. No security meta tags.

## Consequences
- Prevents XSS attacks and protects user data.
- Enhances the security posture of the application.
- Reduces the risk of security vulnerabilities and exploits.

## Implementation Guidelines
- Define a strict CSP that allows only trusted sources for scripts, styles, and other resources.
- Sandbox iframes to prevent them from accessing sensitive data or executing malicious code.
- Implement meta tags to disable browser features that can be exploited for attacks.