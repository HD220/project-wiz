import styled from 'styled-components';

export const DashboardContainer = styled.div`
  display: flex;
  padding: 20px;
  gap: 20px;
  background-color: #f4f7f9;
  min-height: 100vh;
`;

export const Column = styled.div`
  flex: 1;
  background-color: #e9edf0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ColumnTitle = styled.h2`
  font-size: 1.2em;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
`;

export const JobCardContainer = styled.div`
  background-color: #ffffff;
  border: 1px solid #d1d9e0;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px; // Add some gap for internal elements like buttons
`;

export const JobId = styled.p`
  font-size: 0.8em;
  color: #555;
  margin: 0 0 5px 0;
`;

export const JobName = styled.p`
  font-size: 1em;
  color: #333;
  margin: 0;
`;

export const ActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

export const ActionButton = styled.button`
  padding: 6px 12px;
  font-size: 0.9em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const PauseButton = styled(ActionButton)`
  background-color: #ffc107; // Yellow
  color: #212529;

  &:hover {
    background-color: #e0a800;
  }
`;

export const CancelButton = styled(ActionButton)`
  background-color: #dc3545; // Red
  color: white;

  &:hover {
    background-color: #c82333;
  }
`;

// Style for error messages on the dashboard
export const ErrorDisplay = styled.div`
  padding: 10px;
  background-color: #f8d7da; // Light red
  color: #721c24; // Dark red
  border: 1px solid #f5c6cb; // Reddish border
  border-radius: 4px;
  margin: 20px;
  text-align: center;
`;
