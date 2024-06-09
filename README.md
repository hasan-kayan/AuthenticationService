# service-auth

To Install:

```
yarn install
```

To Start Server:

```
yarn start
```

To build and push with DOCKER to Artifact Registry from Macbook M2 Silicon:

```
docker buildx build --platform linux/amd64 -t us-central1-docker.pkg.dev/kend-400012/kend-images/auth-image:latest --push .
```

To build and push with Google Cloud Build to Artifact Registry:

```
gcloud builds submit --tag us-central1-docker.pkg.dev/kend-400012/kend-images/auth-image:latest .
```
