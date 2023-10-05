import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { options } from './api/auth/[...nextauth]/options';
import prisma from '@/lib/db';
import SignInButton from '@/components/buttons/SignInButton';
import RulesButton from '@/components/buttons/RulesButton';

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
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">EDEN Heardle</h1>
          {user && <h2 className="text-3xl font-semibold">Hello {user?.name}!</h2>}
          <p className="py-6">{getConditionalDescription()}</p>
          <div className="flex justify-center gap-2">
            {!user && <RulesButton />}
            {!user && <SignInButton />}
            <Link href="/play">
              <button className="btn btn-primary">Play</button>
            </Link>
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
  );
}
