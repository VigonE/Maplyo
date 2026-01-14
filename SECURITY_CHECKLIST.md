# Security Checklist for Maplyo Deployment

Before deploying Maplyo to production or making your fork public, ensure all these security measures are in place.

## ✅ Pre-deployment Security Checklist

### Environment & Secrets

- [ ] **JWT_SECRET is set** - Generate a strong random 32-byte hex string
- [ ] **No .env file in git** - Verify with `git status` that .env is ignored
- [ ] **Environment variables are secure** - All sensitive data in .env, not in code
- [ ] **.env.example has no real secrets** - Only contains placeholder values

### Code Security

- [ ] **No hardcoded credentials** - Search for passwords, API keys, tokens
- [ ] **No fallback secrets in code** - Server should fail if JWT_SECRET missing
- [ ] **Database credentials secured** - Not committed to repository
- [ ] **API keys externalized** - Geocoding and other API keys in environment variables

### Access Control

- [ ] **Change default admin password** - After first login or use init-superuser script
- [ ] **CORS configured properly** - Restrict origins in production
- [ ] **Rate limiting implemented** - Protect against brute force (consider adding)
- [ ] **Input validation** - All user inputs are validated and sanitized

### Data Protection

- [ ] **Passwords hashed with bcrypt** - Never store plain text passwords ✅
- [ ] **SQL injection prevention** - Use parameterized queries ✅
- [ ] **XSS protection** - Sanitize user input in Vue components
- [ ] **CSRF protection** - Consider adding for state-changing operations

### Network Security

- [ ] **HTTPS in production** - Use SSL/TLS certificates
- [ ] **Secure headers** - Add helmet.js or similar for Express
- [ ] **WebSocket security** - Validate socket connections with JWT
- [ ] **Database not exposed** - SQLite file not accessible via web

### Dependency Security

- [ ] **Dependencies up to date** - Run `npm audit` regularly
- [ ] **No known vulnerabilities** - Check with `npm audit fix`
- [ ] **Minimal dependencies** - Remove unused packages
- [ ] **Lock file committed** - package-lock.json in repository ✅

### Monitoring & Logging

- [ ] **Error logging configured** - Don't expose stack traces to users
- [ ] **Access logs enabled** - Track authentication attempts
- [ ] **Sensitive data not logged** - Passwords, tokens never in logs
- [ ] **Monitoring in place** - Track unusual activity

## 🔐 Commands for Security Checks

### Check for secrets in code
```bash
# Search for potential hardcoded secrets
grep -r "password.*=.*['\"]" --include="*.js" --include="*.vue" --include="*.cjs"
grep -r "api[_-]?key.*=.*['\"]" --include="*.js" --include="*.vue" --include="*.cjs"
grep -r "secret.*=.*['\"]" --include="*.js" --include="*.vue" --include="*.cjs"
```

### Generate secure JWT secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check npm vulnerabilities
```bash
npm audit
npm audit fix
```

### Verify .gitignore is working
```bash
git status --ignored
```

## 🚨 What NOT to commit

- ❌ `.env` files with real credentials
- ❌ Database files (*.db, *.sqlite)
- ❌ API keys or tokens
- ❌ Private keys or certificates
- ❌ node_modules directory
- ❌ User data or backups

## 📝 Production Environment Variables

Required environment variables for production deployment:

```env
# REQUIRED - Security
JWT_SECRET=<64-char-hex-string>

# REQUIRED - Environment
NODE_ENV=production
PORT=<your-port>

# OPTIONAL - Features
GEOCODING_API_KEY=<your-key>
MAPQUEST_API_KEY=<your-key>
```

## 🔍 Regular Security Maintenance

- **Weekly**: Run `npm audit` and fix vulnerabilities
- **Monthly**: Review access logs for suspicious activity
- **Quarterly**: Update all dependencies
- **Yearly**: Rotate JWT_SECRET and force re-authentication

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Vue.js Security](https://vuejs.org/guide/best-practices/security.html)

---

**Remember**: Security is an ongoing process, not a one-time setup. Stay vigilant and keep your dependencies updated!
