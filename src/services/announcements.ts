import { Announcement } from '@/utils/redis';

const announcementsUrlEndpoint = '/api/announcements';

export const getAnnouncement = async () => {
  try {
    const response = await fetch(announcementsUrlEndpoint);
    if (!response.ok) throw new Error('Failed to get announcements');

    const { announcements }: { announcements: Announcement[] } = await response.json();
    return announcements[0];
  } catch (err) {
    throw new Error('Failed to get announcements');
  }
};
