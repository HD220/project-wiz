import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  FolderOpen,
  Plus,
  Sparkles,
  Users,
  Zap,
  Clock,
  Shield,
  Target,
} from "lucide-react";

import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { useAuth } from "@/renderer/contexts/auth.context";
import { ActivityItem } from "@/renderer/features/app/components/activity-item";

export function WelcomeView() {
  const { user } = useAuth();

  // Get current time for dynamic greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="min-h-full bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="px-6 pt-6 pb-8">
          <div className="max-w-5xl mx-auto">
            {/* Welcome Header */}
            <div className="text-center space-y-[var(--spacing-component-md)] mb-8">
              <div className="inline-flex items-center gap-[var(--spacing-component-sm)] px-[var(--spacing-component-md)] py-[var(--spacing-component-xs)] rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <Sparkles className="size-4" />
                Welcome to Project Wiz
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight lg:text-4xl">
                {greeting}, {user?.username || "Desenvolvedor"}!
              </h1>
              <p className="text-lg text-muted-foreground max-w-prose mx-auto">
                Ready to revolutionize your development workflow with AI-based
                automation and intelligent project management?
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-[var(--spacing-component-md)] mb-10">
              <Button
                asChild
                size="lg"
                className="gap-[var(--spacing-component-sm)]"
              >
                <Link to="/user/agents/new">
                  <Plus className="size-4" />
                  Criar Seu Primeiro Agente
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-[var(--spacing-component-sm)]"
              >
                <Link to="/project/new">
                  <FolderOpen className="size-4" />
                  Iniciar um Projeto
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-screen-xl mx-auto space-y-8">
          {/* Feature Cards */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Comece em Minutos
              </h2>
              <p className="text-muted-foreground text-sm">
                Escolha seu caminho para desenvolvimento com IA
              </p>
            </div>

            <div className="grid gap-[var(--spacing-component-md)] md:grid-cols-2 lg:grid-cols-3">
              {/* Quick Start Card */}
              <Card className="group border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-[var(--spacing-component-md)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-[var(--spacing-component-sm)]">
                        <CardTitle className="text-base">
                          Início Rápido
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          Recomendado
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        Launch your first AI agent in 60 seconds
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-[var(--spacing-component-md)]">
                  <p className="text-sm text-muted-foreground">
                    Accelerate your automation journey with our guided setup.
                    Create your first AI agent and experience intelligent
                    workflows.
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full gap-[var(--spacing-component-sm)] h-8"
                  >
                    <Link to="/user/agents/new">
                      Começar
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Projects Card */}
              <Card className="group hover:border-blue-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-[var(--spacing-component-md)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">Project Hub</CardTitle>
                      <CardDescription className="text-xs">
                        Organize and manage your development projects
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-[var(--spacing-component-md)]">
                  <p className="text-sm text-muted-foreground">
                    Centralize your repositories, track progress and collaborate
                    seamlessly with your team using project management tools.
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full gap-[var(--spacing-component-sm)] h-8"
                  >
                    <Link to="/projects">
                      Explorar Projetos
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Community Card */}
              <Card className="group hover:border-green-500/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-[var(--spacing-component-md)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">AI Community</CardTitle>
                      <CardDescription className="text-xs">
                        Connect with fellow AI developers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-[var(--spacing-component-md)]">
                  <p className="text-sm text-muted-foreground">
                    Join our vibrant community of developers. Share knowledge,
                    discover best practices, and get help from AI experts.
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full gap-[var(--spacing-component-sm)] h-8"
                  >
                    <Link to="/community">
                      Join Community
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Benefits Section */}
          <section>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Por que Escolher o Project Wiz?
              </h2>
              <p className="text-muted-foreground text-sm">
                Construído para desenvolvedores, por desenvolvedores
              </p>
            </div>

            <div className="grid gap-[var(--spacing-component-md)] md:grid-cols-3">
              <div className="flex items-start gap-[var(--spacing-component-md)] p-[var(--spacing-component-md)] rounded-lg bg-card border">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Economize Tempo
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Automatize tarefas repetitivas e foque no que mais importa
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-[var(--spacing-component-md)] p-[var(--spacing-component-md)] rounded-lg bg-card border">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10">
                  <Shield className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Seguro
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Segurança empresarial com processamento local de dados
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-[var(--spacing-component-md)] p-[var(--spacing-component-md)] rounded-lg bg-card border">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/10">
                  <Target className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Preciso
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Agentes de IA treinados para fluxos de desenvolvimento
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <Card>
              <CardHeader className="border-b border-border/50 pb-3">
                <div className="flex items-center gap-[var(--spacing-component-md)]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Atividade Recente
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Suas últimas interações e atualizações do sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-[var(--spacing-component-md)]">
                  <ActivityItem
                    icon={<div className="w-2 h-2 bg-green-500 rounded-full" />}
                    title="Login realizado com sucesso no Project Wiz"
                    timestamp="Agora mesmo"
                    variant="success"
                  />
                  <ActivityItem
                    icon={<div className="w-2 h-2 bg-primary rounded-full" />}
                    title="Bem-vindo! Seu espaço de trabalho está pronto para usar"
                    timestamp="Hoje"
                    variant="info"
                  />
                  <ActivityItem
                    icon={<div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    title="Sistema atualizado com os últimos modelos de IA"
                    timestamp="Ontem"
                    variant="info"
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground text-center">
                    Start by creating agents and projects to see more activity
                    here
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
