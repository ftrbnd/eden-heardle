import { getServerSession } from 'next-auth';
import { options } from './api/auth/[...nextauth]/options';
import prisma from '@/utils/db';
import SignInButton from '@/components/buttons/SignInButton';
import RulesButton from '@/components/buttons/RulesButton';
import { PlayButton } from '@/components/buttons/PlayButton';
import EdenLogo from '@/components/EdenLogo';
import Banner from '@/components/ads/Banner';

async function getUserDetails() {
  const session = await getServerSession(options);
  if (!session) return { user: null, guesses: null };

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    });

    const userGuesses = await prisma.guesses.findUnique({
      where: {
        userId: session.user.id
      },
      select: {
        songs: true
      }
    });

    return { user, guesses: userGuesses?.songs };
  } catch (err) {
    console.log('Failed to get user details: ', err);
    return { user: null, guesses: null };
  }
}

async function getHeardleDayNumber() {
  try {
    const dayNumber = await prisma.dailySong.findFirst({
      select: {
        heardleDay: true
      }
    });

    return dayNumber?.heardleDay;
  } catch (err) {
    console.log('Failed to get Heardle Day Number: ', err);
    return -1;
  }
}

export default async function Home() {
  const { user, guesses } = await getUserDetails();
  const dayNumber = await getHeardleDayNumber();

  const getConditionalDescription = (): string => {
    if (!guesses || !guesses.length) return 'Get 6 chances to guess an EDEN song.';

    if (guesses.at(-1)?.correctStatus == 'CORRECT') {
      return "Great job on today's puzzle! Check out your progress.";
    }
    if (guesses.length === 6 && guesses.at(-1)?.correctStatus !== 'CORRECT') {
      return "Tomorrow's a new day, with a new puzzle. See you then.";
    }
    if (guesses.length < 6 && guesses.length > 0) {
      return `You're on attempt ${guesses.length + 1} out of 6. Keep it up!`;
    } else {
      return 'Get 6 chances to guess an EDEN song.';
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-16">
      <Banner data-ad-slot="3863843568" data-ad-format="auto" data-full-width-responsive="true" />
      <div className="hero flex-1 w-full">
        <div className="hero-content text-center w-full">
          <div className="max-w-md">
            <div className="flex gap-2 justify-center items-center h-3/5">
              <EdenLogo height={50} width={50} />
              <h1 className="text-4xl md:text-5xl font-bold">EDEN Heardle</h1>
            </div>
            {user && <h2 className="text-2xl md:text-3xl font-semibold">Hello {user?.name}!</h2>}
            <p className="py-6">{getConditionalDescription()}</p>
            <div className="flex justify-center gap-2">
              {!user && (
                <>
                  <RulesButton />
                  <SignInButton />
                </>
              )}
              <PlayButton />
            </div>
            <div className="flex flex-col py-6">
              <h4 className="text-sm font-semibold">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h4>
              <h5 className="text-sm">No. {dayNumber}</h5>
              <h6 className="text-sm font-light">Created by giosalad</h6>
            </div>
          </div>
        </div>
      </div>
      <Banner data-ad-slot="3863843568" data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}
