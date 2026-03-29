# GIS Backend

Minimal Node.js backend scaffold for Vercel deployment.

## Structure

- `src/routes` contains route definitions.
- `src/controllers` contains route logic.
- `src/models` contains MongoDB/Mongoose models.
- `api/index.js` exposes the app for Vercel serverless deployment.
- `server.js` runs the same app locally.

## Environment Variables

Create a `.env` file from `.env.example`.

- `MONGODB_URI=your-mongodb-connection-string`
- `AWS_ACCESS_KEY_ID=your-access-key`
- `AWS_SECRET_ACCESS_KEY=your-secret-key`
- `S3_REGION=your-bucket-region`
- `S3_BUCKET=your-bucket-name`
- `PORT=3000`

## Local Run

```bash
npm install
npm start
```

## Test Endpoints

- `GET /`
- `GET /api/health`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/files`
- `POST /api/files/upload`
- `GET /api/files/url?key=your/object/key`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:slug`
- `PUT /api/projects/:slug`
- `DELETE /api/projects/:slug`
- `POST /api/projects/:slug/gallery`
- `DELETE /api/projects/:slug/gallery?key=your/object/key`
- `POST /api/auth/login`
# gis_backend_nandani
