import { clientEnv } from '@/utils/env';
import { CustomHeardle, Song } from '@prisma/client';

const CUSTOM_HEARDLE_ENDPOINT_EXPRESS = clientEnv.NEXT_PUBLIC_EXPRESS_URL;
const CUSTOM_HEARDLE_ENDPOINT_NEXT = '/api/customHeardles';

export const getOtherCustomHeardle = async (heardleId: string) => {
  try {
    const response = await fetch(`${CUSTOM_HEARDLE_ENDPOINT_NEXT}/${heardleId}`);
    if (!response.ok) throw new Error(`Failed to get Custom Heardle #${heardleId}`);

    const { customHeardle }: { customHeardle: CustomHeardle } = await response.json();
    return customHeardle;
  } catch (err) {
    throw new Error(`Failed to get Custom Heardle #${heardleId}`);
  }
};

export const createCustomHeardle = async (song: Song, startTime: number, userId: string) => {
  try {
    if (!song || startTime === null || startTime === undefined || !userId) throw new Error('Missing required parameters');

    const response = await fetch(`${CUSTOM_HEARDLE_ENDPOINT_EXPRESS}/heardles/custom`, {
      method: 'POST',
      body: JSON.stringify({ song, startTime, userId }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://eden-heardle.io'
      },
      mode: 'cors'
    });
    if (!response.ok) throw new Error('Failed to create Custom Heardle');

    const { link }: { link: string } = await response.json();
    return link;
  } catch (err) {
    throw new Error('Failed to create Custom Heardle');
  }
};

export const deleteCustomHeardle = async (heardleId: string, userId: string) => {
  try {
    if (!heardleId || !userId) throw new Error('Missing heardleId or userId');

    const response = await fetch(`${CUSTOM_HEARDLE_ENDPOINT_EXPRESS}/heardles/custom`, {
      method: 'DELETE',
      body: JSON.stringify({ heardleId, userId }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://eden-heardle.io'
      },
      mode: 'cors'
    });
    if (!response.ok) throw new Error('Failed to delete Custom Heardle');

    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error('Failed to delete Custom Heardle');
  }
};
