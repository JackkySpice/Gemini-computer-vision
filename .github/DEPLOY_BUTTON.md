# Deploy Buttons Collection

Use these deploy buttons in your README, documentation, or website.

## Render One-Click Deploy

### Standard Button
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision)

**Markdown:**
```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision)
```

**HTML:**
```html
<a href="https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision">
  <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render">
</a>
```

### Badge Version
![Deploy Status](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

**Markdown:**
```markdown
[![Deploy to Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision)
```

### Simple Badge
![Deploy](https://img.shields.io/badge/deploy-render-blue)

**Markdown:**
```markdown
[![Deploy](https://img.shields.io/badge/deploy-render-blue)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision)
```

## Alternative Deploy Options

### Vercel (Frontend Only)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JackkySpice/Gemini-computer-vision&root-directory=apps/web)

**Markdown:**
```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JackkySpice/Gemini-computer-vision&root-directory=apps/web)
```

### Railway (Backend Only)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template?referralCode=new)

**Markdown:**
```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template?referralCode=new)
```

### Heroku
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

**Note:** Requires `app.json` file for Heroku deployment.

## Custom Badges

### Deployment Platform Badges

**Render:**
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

**Vercel:**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Railway:**
![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)

**Docker:**
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

### Tech Stack Badges

**Node.js:**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

**Next.js:**
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)

**Express:**
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

**TypeScript:**
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Gemini:**
![Gemini](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=google&logoColor=white)

## Usage Examples

### In README Header
```markdown
# My Project

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision)

Description of your project...
```

### In Deployment Section
```markdown
## Deployment

### Quick Deploy
Click the button below to deploy both frontend and backend:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision)

See [ONE_CLICK_DEPLOY.md](ONE_CLICK_DEPLOY.md) for detailed instructions.
```

### With Multiple Options
```markdown
## Deploy Options

| Platform | Services | Click to Deploy |
|----------|----------|-----------------|
| Render | Both | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision) |
| Vercel | Frontend | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JackkySpice/Gemini-computer-vision&root-directory=apps/web) |
| Railway | Backend | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template) |
```

## Link Structure

### Render Deploy Link
```
https://render.com/deploy?repo=https://github.com/USERNAME/REPOSITORY
```

**Query Parameters:**
- `repo`: GitHub repository URL
- `branch`: Specific branch (optional, defaults to main)

**Example:**
```
https://render.com/deploy?repo=https://github.com/JackkySpice/Gemini-computer-vision&branch=main
```

### Vercel Deploy Link
```
https://vercel.com/new/clone?repository-url=GITHUB_URL&root-directory=PATH
```

**Query Parameters:**
- `repository-url`: GitHub repository URL
- `root-directory`: Root directory for the project
- `env`: Environment variable names (comma-separated)

**Example:**
```
https://vercel.com/new/clone?repository-url=https://github.com/JackkySpice/Gemini-computer-vision&root-directory=apps/web&env=NEXT_PUBLIC_SERVER_URL
```

## Blueprint Files Required

### Render
**File:** `render.yaml` (in repository root)

Must include:
- Service definitions
- Build commands
- Environment variables
- Health check paths

### Vercel
**File:** `vercel.json` (in project root)

Optional but recommended for configuration.

### Railway
**File:** `railway.json` or `railway.toml`

Optional, Railway can auto-detect Node.js projects.

### Heroku
**File:** `app.json` (in repository root)

Required for Heroku Button deployment.

## Best Practices

1. **Place prominently**: Put deploy button at top of README
2. **Add context**: Explain what gets deployed
3. **Link to guide**: Reference detailed deployment docs
4. **Show prerequisites**: List API keys or accounts needed
5. **Test regularly**: Ensure button works after repo changes
6. **Update URLs**: Keep repository URLs current
7. **Version control**: Blueprint files in version control

## Troubleshooting Deploy Buttons

### Button doesn't work
- Verify repository URL is correct
- Check blueprint file exists and is valid
- Ensure repository is public (or access granted)

### Deployment fails
- Check blueprint syntax
- Verify build commands are correct
- Ensure all required env vars are documented

### Wrong directory deployed
- Check `rootDir` in render.yaml
- Verify `root-directory` in Vercel URL

---

**Last Updated:** October 2025  
**Repository:** https://github.com/JackkySpice/Gemini-computer-vision
