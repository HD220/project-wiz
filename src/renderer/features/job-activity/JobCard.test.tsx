import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobCard from './JobCard';
import { JobStatus } from '../../utils/backendApi'; // Import JobStatus
import * as backendApi from '../../utils/backendApi'; // To mock sendJobCommand

// Mock the backendApi.sendJobCommand function
jest.mock('../../utils/backendApi', () => ({
  ...jest.requireActual('../../utils/backendApi'), // Import and retain default exports
  sendJobCommand: jest.fn(),
}));

const mockOnActionError = jest.fn();

const defaultProps = {
  id: 'job1',
  name: 'Test Job 1',
  onActionError: mockOnActionError,
};

describe('JobCard Component', () => {
  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  test('renders job ID and name correctly', () => {
    render(<JobCard {...defaultProps} status="Pending" />);
    expect(screen.getByText(`ID: ${defaultProps.id}`)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
  });

  // Test button presence for actionable statuses
  test.each<[JobStatus, boolean]>([
    ['Pending', true],
    ['InProgress', true],
    ['Paused', false],
    ['Completed', false],
    ['Failed', false],
    ['Cancelled', false],
  ])('buttons presence for status %s', (status, shouldBePresent) => {
    render(<JobCard {...defaultProps} status={status} />);
    const pauseButton = screen.queryByRole('button', { name: /pause/i });
    const cancelButton = screen.queryByRole('button', { name: /cancel/i });

    if (shouldBePresent) {
      expect(pauseButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    } else {
      expect(pauseButton).not.toBeInTheDocument();
      expect(cancelButton).not.toBeInTheDocument();
    }
  });

  // Test "Pause" button click and sendJobCommand call
  test('calls sendJobCommand with "pause" action when Pause button is clicked', async () => {
    const jobStatus: JobStatus = 'Pending';
    (backendApi.sendJobCommand as jest.Mock).mockResolvedValue(undefined); // Simulate successful command

    render(<JobCard {...defaultProps} status={jobStatus} />);
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);

    expect(backendApi.sendJobCommand).toHaveBeenCalledWith(defaultProps.id, 'pause');
    expect(backendApi.sendJobCommand).toHaveBeenCalledTimes(1);
    expect(mockOnActionError).not.toHaveBeenCalled(); // Should not be called on success
  });

  // Test "Cancel" button click and sendJobCommand call
  test('calls sendJobCommand with "cancel" action when Cancel button is clicked', async () => {
    const jobStatus: JobStatus = 'InProgress';
    (backendApi.sendJobCommand as jest.Mock).mockResolvedValue(undefined); // Simulate successful command

    render(<JobCard {...defaultProps} status={jobStatus} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(backendApi.sendJobCommand).toHaveBeenCalledWith(defaultProps.id, 'cancel');
    expect(backendApi.sendJobCommand).toHaveBeenCalledTimes(1);
    expect(mockOnActionError).not.toHaveBeenCalled(); // Should not be called on success
  });

  // Test onActionError when sendJobCommand (pause) fails
  test('calls onActionError when sendJobCommand fails for "pause"', async () => {
    const jobStatus: JobStatus = 'Pending';
    const errorMessage = 'Failed to pause job (simulated)';
    (backendApi.sendJobCommand as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<JobCard {...defaultProps} status={jobStatus} />);
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);

    // Need to wait for the promise rejection to be handled
    await screen.findByText(defaultProps.name); // Ensures component has re-rendered if necessary

    expect(backendApi.sendJobCommand).toHaveBeenCalledWith(defaultProps.id, 'pause');
    expect(mockOnActionError).toHaveBeenCalledWith(errorMessage);
  });

  // Test onActionError when sendJobCommand (cancel) fails
  test('calls onActionError when sendJobCommand fails for "cancel"', async () => {
    const jobStatus: JobStatus = 'InProgress';
    const errorMessage = 'Failed to cancel job (simulated)';
    (backendApi.sendJobCommand as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<JobCard {...defaultProps} status={jobStatus} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await screen.findByText(defaultProps.name);

    expect(backendApi.sendJobCommand).toHaveBeenCalledWith(defaultProps.id, 'cancel');
    expect(mockOnActionError).toHaveBeenCalledWith(errorMessage);
  });
});
