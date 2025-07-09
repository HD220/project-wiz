import React from 'react';
import { JobCardContainer, JobId, JobName, ActionButtonContainer, PauseButton, CancelButton } from './styles';
import { sendJobCommand, JobStatus } from '../../utils/backendApi'; // Adjusted path

interface JobCardProps {
  id: string;
  name: string;
  status: JobStatus;
  onActionError: (error: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ id, name, status, onActionError }) => {
  const handlePause = async () => {
    try {
      await sendJobCommand(id, 'pause');
      // UI update will come via EventBus
    } catch (err) {
      onActionError(err instanceof Error ? err.message : 'Failed to pause job');
    }
  };

  const handleCancel = async () => {
    try {
      await sendJobCommand(id, 'cancel');
      // UI update will come via EventBus
    } catch (err) {
      onActionError(err instanceof Error ? err.message : 'Failed to cancel job');
    }
  };

  const canPerformActions = status === 'Pending' || status === 'InProgress';

  return (
    <JobCardContainer>
      <JobId>ID: {id}</JobId>
      <JobName>{name}</JobName>
      {/* Later we can display status here if needed: <p>Status: {status}</p> */}
      {canPerformActions && (
        <ActionButtonContainer>
          <PauseButton onClick={handlePause} disabled={!canPerformActions}>Pause</PauseButton>
          <CancelButton onClick={handleCancel} disabled={!canPerformActions}>Cancel</CancelButton>
        </ActionButtonContainer>
      )}
    </JobCardContainer>
  );
};

export default JobCard;
