import React from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { DialogFooter } from "@/ui/dialog";

interface CreateProjectFormProps {
  projectName: string;
  setProjectName: (name: string) => void;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  projectName,
  setProjectName,
  handleSubmit,
  loading,
  error,
  onCancel,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="projectName" className="text-right">
            Project Name
          </Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(changeEvent) => setProjectName(changeEvent.target.value)}
            className="col-span-3"
            required
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CreateProjectForm;
