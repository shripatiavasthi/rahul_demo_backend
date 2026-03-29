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
# gis_backend_nandani
