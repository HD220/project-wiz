import { createFileRoute } from '@tanstack/react-router';
import { RepositoriesController } from '../../application/RepositoriesController';
import RepositorySettings from '@/components/repository-settings';

// Presentation component for the main repositories page
function RepositoriesPageRoute() {
  return <RepositoriesController />;
}

// Presentation component for repository settings
function RepositorySettingsPage() {
  return <RepositorySettings />;
}

// TanStack Router route definition
export const Route = createFileRoute('/repositories/infrastructure/router/repositories-router')({
  component: RepositorySettingsPage,
});

export default RepositoriesPageRoute;