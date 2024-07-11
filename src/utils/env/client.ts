import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_EXPRESS_URL: z.string().url(),

    NEXT_PUBLIC_SHOW_BANNER: z.coerce.boolean().optional(),
    NEXT_PUBLIC_ANNOUNCEMENT_TEXT: z.string().optional(),
    NEXT_PUBLIC_ANNOUNCEMENT_LINK: z.string().optional(),
    NEXT_PUBLIC_ANNOUNCEMENT_STATUS: z.enum(['success', 'info', 'error']).optional()
  },
  runtimeEnv: {
    NEXT_PUBLIC_EXPRESS_URL: process.env.NEXT_PUBLIC_EXPRESS_URL,

    NEXT_PUBLIC_SHOW_BANNER: process.env.NEXT_PUBLIC_SHOW_BANNER,
    NEXT_PUBLIC_ANNOUNCEMENT_TEXT: process.env.NEXT_PUBLIC_ANNOUNCEMENT_TEXT,
    NEXT_PUBLIC_ANNOUNCEMENT_LINK: process.env.NEXT_PUBLIC_ANNOUNCEMENT_LINK,
    NEXT_PUBLIC_ANNOUNCEMENT_STATUS: process.env.NEXT_PUBLIC_ANNOUNCEMENT_STATUS
  }
});
