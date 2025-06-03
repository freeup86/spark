import Link from "next/link";
import { Button } from "../components/ui/button";
import { ArrowRight, Lightbulb, Users, TrendingUp, Globe, Zap, Shield } from "lucide-react";

export const metadata = {
  title: "Spark - Innovation Platform | Transform Ideas Into Reality",
  description: "Join 10K+ innovators on Spark. Share ideas, collaborate on projects, and launch startups with AI-powered tools. Start creating today!",
  openGraph: {
    title: "Spark - Innovation Platform | Transform Ideas Into Reality",
    description: "Join 10K+ innovators on Spark. Share ideas, collaborate on projects, and launch startups with AI-powered tools.",
    url: "https://spark-frontend-59cy.onrender.com",
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Spark</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Transform Ideas Into Reality
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 10,000+ innovators worldwide. Share ideas, collaborate on projects, and launch startups with AI-powered tools and expert mentorship.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Creating <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">
                Explore Ideas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Innovate</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card p-6 rounded-lg border">
            <Lightbulb className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Idea Generation</h3>
            <p className="text-muted-foreground">
              AI-powered brainstorming tools help you develop and refine your ideas into actionable projects.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Collaboration Hub</h3>
            <p className="text-muted-foreground">
              Connect with like-minded innovators, form teams, and work together in real-time.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Project Development</h3>
            <p className="text-muted-foreground">
              Track progress, manage resources, and get expert guidance to bring your ideas to market.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary">10K+</p>
              <p className="text-muted-foreground">Active Innovators</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">2.5K</p>
              <p className="text-muted-foreground">Projects Launched</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">50+</p>
              <p className="text-muted-foreground">Countries</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">95%</p>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why Choose Spark?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Globe className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Global Network</h3>
                  <p className="text-muted-foreground">Connect with innovators worldwide and access diverse perspectives.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Zap className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Tools</h3>
                  <p className="text-muted-foreground">Leverage cutting-edge AI to enhance your creative process.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Secure & Private</h3>
                  <p className="text-muted-foreground">Your ideas are protected with enterprise-grade security.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to spark innovation?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of creators who are turning their ideas into reality.
            </p>
            <Link href="/register">
              <Button className="w-full" size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Spark</span>
              <span className="text-muted-foreground">© 2024</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground">About</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
