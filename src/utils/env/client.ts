import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_EXPRESS_URL: z.string().url(),
    NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID: z.string()
  },
  runtimeEnv: {
    NEXT_PUBLIC_EXPRESS_URL: process.env.NEXT_PUBLIC_EXPRESS_URL,
    NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID
  }
});
