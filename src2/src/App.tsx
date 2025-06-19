import React, { useState, useEffect } from 'react';
// Ajustar o caminho para os tipos, assumindo que App.tsx está em src2/src/
import type { Job, NewJob } from '../core/domain/schemas';
import './App.css'; // Se você tiver um App.css para estilização básica

function App() {
  const [message, setMessage] = useState<string>('Pronto.');
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [projectId, setProjectId] = useState<string>('project_default_123'); // ID do projeto para teste

  // Efeito para criar um projeto padrão no DB ao iniciar a UI, se não existir.
  // Isso é apenas para facilitar o teste da UI sem depender de um DB pré-populado.
  // Em uma aplicação real, a criação de projetos seria uma funcionalidade da UI separada.
  // E o Drizzle não deve ser chamado diretamente do renderer assim.
  // Este é um HACK para teste.
  /*
  useEffect(() => {
    const ensureProjectExists = async () => {
      // Esta função é ilustrativa, não vai funcionar diretamente no renderer
      // porque o renderer não tem acesso direto ao 'db' ou 'projectsTable'.
      // Precisaria de um IPC handler para 'project:ensureExists'
      try {
        // Exemplo de como seria no main process:
        // let project = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1);
        // if (!project.length) {
        //   await db.insert(projectsTable).values({ id: projectId, name: 'Projeto Padrão', caminho_working_directory: './workdir_default' });
        //   setMessage(`Projeto padrão ${projectId} assegurado.`);
        // }
        setMessage(`Pronto. Certifique-se que o projeto com ID "${projectId}" existe no banco de dados.`);
      } catch (e) {
        setMessage(`Erro ao assegurar projeto: ${(e as Error).message}`);
      }
    };
    ensureProjectExists();
  }, [projectId]);
  */


  const handleAddJob = async () => {
    if (!projectId) {
      setMessage("Por favor, defina um ID de Projeto para criar um Job.");
      return;
    }
    const jobData: NewJob = {
      name: 'Meu Job de Teste via UI ' + Date.now(),
      project_id: projectId,
      payload: { data: 'informação do job ' + Math.random().toString(36).substring(7) },
      priority: Math.floor(Math.random() * 10),
      persona_id: 'persona_test_ui',
      // Outros campos usarão defaults do schema ou podem ser omitidos se opcionais no NewJob
    };
    setMessage(`Adicionando job: ${jobData.name}`);
    console.log('Enviando jobData:', jobData);
    try {
      const result = await window.electronAPI.queueAddJob(jobData);
      console.log('Resultado de addJob:', result);
      if (result.success && result.job) {
        setMessage(`Job adicionado: ${result.job.id} - ${result.job.name}`);
      } else {
        setMessage(`Erro ao adicionar job: ${result.error}`);
      }
    } catch (e) {
      setMessage(`Exceção ao adicionar job: ${(e as Error).message}`);
      console.error(e);
    }
  };

  const handleGetNextJob = async () => {
    setMessage('Buscando próximo job...');
    console.log('Chamando queueGetNextJob');
    try {
      const result = await window.electronAPI.queueGetNextJob({ personaId: 'persona_test_ui', excludedIds: currentJob ? [currentJob.id] : [] });
      console.log('Resultado de getNextJob:', result);
      if (result.success) {
        setCurrentJob(result.job || null);
        setMessage(result.job ? `Job obtido: ${result.job.id} - ${result.job.name} (Status: ${result.job.status})` : 'Nenhum job na fila para persona_test_ui.');
      } else {
        setMessage(`Erro ao buscar job: ${result.error}`);
      }
    } catch (e) {
      setMessage(`Exceção ao buscar job: ${(e as Error).message}`);
      console.error(e);
    }
  };

  const handleCompleteJob = async () => {
    if (!currentJob) {
      setMessage("Nenhum job selecionado para completar.");
      return;
    }
    setMessage(`Completando job: ${currentJob.id}`);
    console.log('Chamando queueCompleteJob para:', currentJob.id);
    try {
      const result = await window.electronAPI.queueCompleteJob(currentJob.id, { outcome: 'Sucesso manual via UI' });
      console.log('Resultado de completeJob:', result);
      if (result.success && result.job) {
        setMessage(`Job completado: ${result.job.id} - Status: ${result.job.status}`);
        setCurrentJob(null); // Limpar job atual
      } else {
        setMessage(`Erro ao completar job: ${result.error}`);
      }
    } catch (e) {
      setMessage(`Exceção ao completar job: ${(e as Error).message}`);
      console.error(e);
    }
  };

  const handleFailJob = async () => {
    if (!currentJob) {
      setMessage("Nenhum job selecionado para falhar.");
      return;
    }
    setMessage(`Falhando job: ${currentJob.id}`);
    console.log('Chamando queueFailJob para:', currentJob.id);
    try {
      const result = await window.electronAPI.queueFailJob(currentJob.id, 'Falha manual via UI');
      console.log('Resultado de failJob:', result);
      if (result.success && result.job) {
        setMessage(`Job falhou: ${result.job.id} - Status: ${result.job.status} - Tentativas: ${result.job.attempts}`);
        setCurrentJob(null); // Limpar job atual
      } else {
        setMessage(`Erro ao falhar job: ${result.error}`);
      }
    } catch (e) {
      setMessage(`Exceção ao falhar job: ${(e as Error).message}`);
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Teste do Sistema de Filas Project Wiz</h1>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="projectId" style={{ marginRight: '10px' }}>ID do Projeto para Teste:</label>
        <input
          type="text"
          id="projectId"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="ex: project_default_123"
          style={{padding: '5px'}}
        />
        <p><small>Nota: Este projeto (ID: {projectId}) precisa existir na tabela 'projects' do banco de dados para que a criação de Jobs funcione corretamente devido à Foreign Key.</small></p>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleAddJob} style={{ marginRight: '10px', padding: '10px' }}>Adicionar Job de Teste</button>
        <button onClick={handleGetNextJob} style={{ padding: '10px' }}>Pegar Próximo Job (persona_test_ui)</button>
      </div>
      {currentJob && (
        <div style={{ marginTop: '10px', marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Job Atual Pego:</h3>
          <button onClick={handleCompleteJob} style={{ marginRight: '10px', padding: '10px', backgroundColor: 'lightgreen' }}>Completar Job ({currentJob.id?.substring(0,6)}...)</button>
          <button onClick={handleFailJob} style={{ padding: '10px', backgroundColor: 'lightcoral' }}>Falhar Job ({currentJob.id?.substring(0,6)}...)</button>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#f0f0f0', padding: '10px', marginTop: '10px' }}>
            {JSON.stringify(currentJob, null, 2)}
          </pre>
        </div>
      )}
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
        <strong>Mensagem do Sistema:</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default App;
