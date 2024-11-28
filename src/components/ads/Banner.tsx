'use client';

import useAds from '@/hooks/useAds';
import { clientEnv } from '@/utils/env';
import { cn } from '@/utils/helpers';
import Router from 'next/router';
import { useEffect } from 'react';
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdsBannerProps {
  'data-ad-slot': string;
  'data-ad-format': string;
  'data-full-width-responsive'?: 'true';
  desktopOnly?: boolean;
  className?: string;
}

const handleRouteChange = () => {
  const intervalId = setInterval(() => {
    try {
      // Check if the 'ins' element already has an ad in it
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
        clearInterval(intervalId);
      }
    } catch (err) {
      console.error('Error pushing ads: ', err);
      clearInterval(intervalId); // Ensure we clear interval on errors too
    }
  }, 100);

  return () => clearInterval(intervalId); // Clear interval on component unmount
};

export default function Banner(props: AdsBannerProps) {
  const { preference } = useAds();

  useEffect(() => {
    // Run the function when the component mounts
    handleRouteChange();

    // Subscribe to route changes
    if (typeof window !== 'undefined') {
      Router.events.on('routeChangeComplete', handleRouteChange);

      // Unsubscribe from route changes when the component unmounts
      return () => {
        Router.events.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, []);

  return preference ? (
    <div
      className={cn(
        'overflow-hidden block h-full w-full',
        {
          'hidden md:block': props.desktopOnly,
          'border border-solid border-red-600 bg-red-600': process.env.NODE_ENV === 'development'
        },
        props.className
      )}
    >
      <ins className="adsbygoogle adbanner-customize" data-ad-client={clientEnv.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID} {...props} />
    </div>
  ) : (
    <></>
  );
}
