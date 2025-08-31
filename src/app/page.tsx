import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Basketball, Users, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-basketball-gray via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-basketball-orange to-orange-600 rounded-lg flex items-center justify-center">
                <Basketball className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-basketball-dark">
                Basketball Team Builder
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/players" className="text-gray-600 hover:text-basketball-orange transition-colors">
                Players
              </Link>
              <Link href="/teams" className="text-gray-600 hover:text-basketball-orange transition-colors">
                Teams
              </Link>
              <Link href="/matches" className="text-gray-600 hover:text-basketball-orange transition-colors">
                Matches
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-basketball-dark mb-6">
            Build Your Dream
            <span className="text-basketball-orange"> Basketball Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Create teams from your favorite NBA players, simulate epic matches, and experience 
            AI-powered play-by-play commentary. Just like your sports cards, but digital!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="basketball" className="text-lg px-8 py-3">
              <Users className="w-5 h-5 mr-2" />
              Start Building Teams
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              <Trophy className="w-5 h-5 mr-2" />
              View Matches
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-all duration-300 border-orange-200">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-basketball-orange" />
              </div>
              <CardTitle>Player Database</CardTitle>
              <CardDescription>
                Browse thousands of NBA players with detailed statistics and performance metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-green-200">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Basketball className="w-6 h-6 text-basketball-court" />
              </div>
              <CardTitle>Team Builder</CardTitle>
              <CardDescription>
                Drag and drop players to create balanced teams with position assignments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-blue-200">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-basketball-blue" />
              </div>
              <CardTitle>AI Simulation</CardTitle>
              <CardDescription>
                Experience realistic match simulations with AI-generated play-by-play commentary
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-3xl font-bold text-center text-basketball-dark mb-8">
            Ready to Play?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-basketball-orange mb-2">500+</div>
              <div className="text-gray-600">NBA Players</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-basketball-court mb-2">5</div>
              <div className="text-gray-600">Positions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-basketball-blue mb-2">∞</div>
              <div className="text-gray-600">Team Combinations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">AI</div>
              <div className="text-gray-600">Powered Commentary</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-basketball-orange to-orange-600 text-white border-0">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">
                Start Your Basketball Journey Today
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Build teams, simulate matches, and experience the excitement of basketball like never before!
              </p>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-basketball-dark text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">
            © 2024 Basketball Team Builder. Built with Next.js, TypeScript, and ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
