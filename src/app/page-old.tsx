import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Search } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Build Your Dream Basketball Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Browse NBA players, create balanced teams, and build your perfect lineup.
            Simple, clean, and focused on what matters most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/players">
              <Button size="lg" className="text-lg px-8 py-3">
                <Search className="w-5 h-5 mr-2" />
                Browse Players
              </Button>
            </Link>
            <Link href="/teams">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <Users className="w-5 h-5 mr-2" />
                Build Teams
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Browse Players</CardTitle>
              <CardDescription>
                Search through NBA players by name and position. View essential stats like PPG, RPG, and APG.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Build Teams</CardTitle>
              <CardDescription>
                Create balanced teams by adding players with simple button clicks. Focus on what matters most.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <Card className="border">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Ready to Build Your Team?
              </h3>
              <p className="text-muted-foreground mb-6">
                Start by browsing our database of NBA players and create your perfect lineup.
              </p>
              <Link href="/players">
                <Button size="lg" className="text-lg px-8 py-3">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Basketball Team Builder. Built with Next.js and TypeScript.
          </p>
        </div>
      </footer>
    </div>
  );
}
