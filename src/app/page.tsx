import { Button } from '@/components/ui/button';
import { Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <div className="text-9xl">🏀</div>

          <h1 className="text-6xl md:text-7xl font-black text-orange-600">
            Build Your Team!
          </h1>

          <p className="text-2xl text-gray-700">
            Pick NBA players and make them battle!
          </p>
          <div className="flex flex-col gap-4 pt-8">
            <Link href="/teams" className="w-full">
              <Button
                size="lg"
                className="w-full h-20 text-3xl font-bold bg-orange-500 hover:bg-orange-600 shadow-xl"
              >
                <Zap className="w-8 h-8 mr-3" />
                Start Building!
              </Button>
            </Link>

            <Link href="/matches" className="w-full">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-20 text-3xl font-bold border-4 border-orange-500 text-orange-600 hover:bg-orange-50 shadow-lg"
              >
                <Trophy className="w-8 h-8 mr-3" />
                Play Match
              </Button>
            </Link>
          </div>

          <div className="pt-12 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-md border-4 border-orange-200">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black text-orange-500">1</div>
                <div className="text-left">
                  <p className="text-2xl font-bold">Pick Players</p>
                  <p className="text-lg text-gray-600">Search for LeBron, Jordan, or anyone!</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border-4 border-orange-200">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black text-orange-500">2</div>
                <div className="text-left">
                  <p className="text-2xl font-bold">Build Teams</p>
                  <p className="text-lg text-gray-600">Make Team 1 and Team 2</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border-4 border-orange-200">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black text-orange-500">3</div>
                <div className="text-left">
                  <p className="text-2xl font-bold">Watch Them Play!</p>
                  <p className="text-lg text-gray-600">See who wins!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-xl text-gray-500">
              🔥 26,000+ real NBA players to choose from!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
