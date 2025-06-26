import React from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Button } from '@/presentation/ui/components/ui/button';
import { Zap } from 'lucide-react'; // Example Icon

function HomePublicPageComponent() {
  return (
    <div className="text-center">
      <header className="mb-12">
        <Zap className="w-16 h-16 mx-auto mb-4 text-sky-500" />
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Welcome to Project Wiz!
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Automate your development workflow with intelligent AI agents. Focus on what matters, let Wiz handle the rest.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">Get Started</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/onboarding">
              Start Onboarding
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto" disabled>
            {/* <Link to="/login">Login</Link> */}
            Login (Coming Soon)
          </Button>
        </div>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          New here? The onboarding process will guide you through the initial setup.
        </p>
      </section>

      <section className="max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Key Features (Placeholder)</h3>
        <ul className="list-disc list-inside space-y-2 text-left text-slate-600 dark:text-slate-300">
          <li>Intelligent Task Automation: Let AI agents handle repetitive coding tasks.</li>
          <li>Customizable Agent Personas: Tailor agents to your specific needs and project requirements.</li>
          <li>Seamless VCS Integration: Work with your existing Git repositories effortlessly.</li>
          <li>Extensible Tooling: Equip agents with a variety of tools for diverse development activities.</li>
        </ul>
      </section>
    </div>
  );
}

export const Route = createFileRoute('/(public)/home/')({
  component: HomePublicPageComponent,
});
