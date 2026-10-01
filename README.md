# Smart OBD

Smart OBD is a React application for the Smart OBD library scanner.

## Run locally

```sh
npm ci
npm start
```

## Deploy to GitHub Pages

The `main` branch is automatically built and deployed to:

https://mdshazeb9963-code.github.io/Smart-OBD-library/

The deployment workflow is in `.github/workflows/deploy.yml`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The workflow publishes the production build and includes a 404 fallback so application routes continue to work when opened directly.
