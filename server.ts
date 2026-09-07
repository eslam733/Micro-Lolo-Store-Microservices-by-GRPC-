import express from 'express';
import app from './gateway';

// Importing express here lets Vercel auto-detect this as an Express entrypoint.
export default app as express.Express;
