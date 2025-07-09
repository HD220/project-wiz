import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import { DashboardContainer, Column, ColumnTitle, ErrorDisplay } from './styles'; // Added ErrorDisplay
import { eventBus } from '../../utils/EventBus';
import { JobStatus, MockJob as Job } from '../../utils/backendApi'; // Use JobStatus and MockJob as Job

// Define all possible job statuses for the columns
const jobStatuses: JobStatus[] = ['Pending', 'InProgress', 'Paused', 'Completed', 'Failed', 'Cancelled'];

const JobActivityDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null); // Renamed for clarity
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const fetchedJobs: Job[] = [
          { id: 'job_1', name: 'Backend Job A', status: 'Pending' },
          { id: 'job_2', name: 'Backend Job B', status: 'InProgress' },
          { id: 'job_3', name: 'Backend Job C', status: 'Completed' },
          { id: 'job_4', name: 'Backend Job D', status: 'Failed' },
          { id: 'job_5', name: 'Backend Job E', status: 'Pending' },
        ];
        setJobs(fetchedJobs);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'An unknown error occurred during fetch');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();

    const handleJobUpdate = (updatedJob: Job) => {
      // Ensure the name is preserved from the existing job if not provided by the event,
      // or if the event is guaranteed to provide the full job object, this is fine.
      // The mock in backendApi.ts currently sends a name, so this should be okay.
      setJobs(prevJobs => prevJobs.map(job => job.id === updatedJob.id ? {...job, ...updatedJob} : job));
      setActionError(null); // Clear action error on successful update
    };

    const handleNewJob = (newJob: Job) => {
      setJobs(prevJobs => [...prevJobs, newJob]);
      setActionError(null); // Clear action error on new job
    };

    eventBus.on('job-updated', handleJobUpdate);
    eventBus.on('new-job-created', handleNewJob);

    return () => {
      eventBus.off('job-updated', handleJobUpdate);
      eventBus.off('new-job-created', handleNewJob);
    };
  }, []);

  const handleActionError = (errorMessage: string) => {
    setActionError(errorMessage);
    // Optional: Clear the error message after a few seconds
    setTimeout(() => {
      setActionError(null);
    }, 5000); // Clear after 5 seconds
  };

  if (isLoading) {
    return <DashboardContainer>Loading jobs...</DashboardContainer>;
  }

  if (fetchError) {
    // Display fetch error more prominently or differently if desired
    return <ErrorDisplay>Error fetching jobs: {fetchError}</ErrorDisplay>;
  }

  return (
    <>
      {actionError && <ErrorDisplay>Action Error: {actionError}</ErrorDisplay>}
      <DashboardContainer>
        {jobStatuses.map(status => (
          <Column key={status}>
            <ColumnTitle>{status}</ColumnTitle>
            {jobs
              .filter(job => job.status === status)
              .map(job => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  name={job.name}
                  status={job.status}
                  onActionError={handleActionError}
                />
              ))}
          </Column>
        ))}
      </DashboardContainer>
    </>
  );
};

export default JobActivityDashboard;
