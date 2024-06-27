import { LoaderFunction } from '@remix-run/node';
import fs from 'fs';
import path from 'path';

export const loader: LoaderFunction = async () => {
  // set dir as /public folder
  const publicDir = path.join(process.cwd(), 'public');
  // get all files in dir
  const files = fs.readdirSync(publicDir);
  return new Response(JSON.stringify(files), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
