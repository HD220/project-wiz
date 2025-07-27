import { FeatureCard } from "@/renderer/components/shared";
import { cn } from "@/renderer/lib/utils";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

function AuthCard(props: AuthCardProps) {
  const { title, description, children, className } = props;

  return (
    <FeatureCard.Root
      className={cn(
        "w-full max-w-md mx-auto",
        "p-[var(--spacing-layout-lg)] space-y-[var(--spacing-component-xl)]",
        "shadow-lg border-border/50 bg-card/95 backdrop-blur-sm",
        "auth-form-enter", // Animation class
        className,
      )}
      variant="default"
    >
      <FeatureCard.Header className="text-center space-y-[var(--spacing-component-sm)]">
        <FeatureCard.Title className="text-[var(--font-size-3xl)] font-[var(--font-weight-bold)] leading-[var(--line-height-tight)] text-foreground">
          {title}
        </FeatureCard.Title>
        <FeatureCard.Description className="text-[var(--font-size-base)] text-muted-foreground leading-[var(--line-height-normal)]">
          {description}
        </FeatureCard.Description>
      </FeatureCard.Header>
      <FeatureCard.Content className="space-y-[var(--spacing-component-lg)]">
        {children}
      </FeatureCard.Content>
    </FeatureCard.Root>
  );
}

export { AuthCard };
