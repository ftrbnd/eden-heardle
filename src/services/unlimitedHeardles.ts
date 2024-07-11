import { clientEnv } from '@/utils/env';
import { UnlimitedHeardle } from '@prisma/client';

const UNLIMITED_HEARDLE_ENDPOINT_EXPRESS = clientEnv.NEXT_PUBLIC_EXPRESS_URL;

export const getUnlimitedHeardle = async () => {
  try {
    const response = await fetch(`${UNLIMITED_HEARDLE_ENDPOINT_EXPRESS}/heardles/unlimited`);
    if (!response.ok) throw new Error('Failed to get Unlimited Heardle');

    const { unlimitedHeardle }: { unlimitedHeardle: UnlimitedHeardle } = await response.json();
    return unlimitedHeardle;
  } catch (err) {
    throw new Error(`Failed to get Unlimited Heardle`);
  }
};
