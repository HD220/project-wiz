import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { FolderIcon } from "lucide-react";

import {
  StandardFormModal,
  StandardFormModalContent,
  StandardFormModalHeader,
  StandardFormModalBody,
  StandardFormModalFooter,
  StandardFormModalActions,
  StandardFormModalCancelButton,
  StandardFormModalSubmitButton,
} from "@/renderer/components/form-modal";
import { ProjectForm } from "@/renderer/features/project/components/project-form";

function CreateProjectPage() {
  const navigate = useNavigate();
  const router = useRouter();

  function handleSuccess(projectId: string) {
    // Navigate to the new project
    navigate({
      to: "/project/$projectId",
      params: { projectId },
    });
  }

  function handleClose() {
    // Navigate back to previous page
    router.history.back();
  }

  // Correct masked route implementation - single modal only
  return (
    <StandardFormModal
      open
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <StandardFormModalContent className="max-w-2xl">
        <StandardFormModalHeader
          title="Create Project"
          description="Start a new project workspace for your development tasks"
          icon={FolderIcon}
        />

        <StandardFormModalBody>
          <ProjectForm
            onSuccess={handleSuccess}
            onCancel={handleClose}
            submitLabel="Create"
            hideActions={true}
          />
        </StandardFormModalBody>

        <StandardFormModalFooter>
          <StandardFormModalActions>
            <StandardFormModalCancelButton onCancel={handleClose}>
              Cancel
            </StandardFormModalCancelButton>
            <StandardFormModalSubmitButton form="project-form">
              Create Project
            </StandardFormModalSubmitButton>
          </StandardFormModalActions>
        </StandardFormModalFooter>
      </StandardFormModalContent>
    </StandardFormModal>
  );
}

export const Route = createFileRoute("/_authenticated/project/new/")({
  component: CreateProjectPage,
});
