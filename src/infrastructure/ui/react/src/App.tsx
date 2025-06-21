import React, { useEffect, useState } from 'react';
import { AIAgentProps } from '../../../../domain/entities/ai-agent.entity'; // Adjust path as needed
// import { IElectronAPI } from '../../electron/preload'; // Assuming preload.ts exports this

// Types for window.api are now expected to be globally available via vite-env.d.ts

function App() {
  const [agents, setAgents] = useState<AIAgentProps[]>([]);
  const [message, setMessage] = useState<string>("Loading agents...");

  useEffect(() => {
    if (window.api && window.api.listAIAgents) {
      window.api.listAIAgents()
        .then(response => {
          if (response.success && response.data) {
            setAgents(response.data);
            setMessage(`Loaded ${response.data.length} agents.`);
          } else {
            setMessage(`Error loading agents: ${response.error || 'Unknown error'}`);
            console.error("Error loading agents:", response.error);
          }
        })
        .catch(err => {
          setMessage(`Exception loading agents: ${err.message}`);
          console.error("Exception loading agents:", err);
        });
    } else {
      setMessage("Error: Electron API (window.api.listAIAgents) not found. Ensure preload script is working.");
      console.error("window.api or window.api.listAIAgents is not available.");
    }
  }, []);

  return (
    <div>
      <h1>Project Wiz Agents</h1>
      <p>{message}</p>
      {agents.length > 0 && (
        <ul>
          {agents.map(agent => (
            <li key={agent.id}>
              <strong>{agent.name}</strong> (ID: {agent.id})
              <br />
              Model: {agent.modelId} on {agent.provider}
              <br />
              Queue: {agent.queueName}
              <br />
              Tools: {agent.availableTools.join(', ') || 'None'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
