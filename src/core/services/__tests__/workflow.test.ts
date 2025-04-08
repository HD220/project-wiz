import { WorkflowEngine } from '../workflow';
import * as fs from 'fs';

describe('WorkflowEngine', () => {
  let workflowEngine: WorkflowEngine;

  beforeEach(() => {
    workflowEngine = new WorkflowEngine();
  });

  it('should execute the "gerar_codigo" step correctly', async () => {
    const templatePath = 'src/core/services/__tests__/template.txt';
    const outputPath = 'src/core/services/__tests__/output.txt';
    const data = { name: 'Test', value: '123' };

    // Create template file
    fs.writeFileSync(templatePath, 'Hello {{name}}, value: {{value}}');

    const config = {
      template: templatePath,
      output: outputPath,
      data: data,
    };

    // Mock gerarCodigo method
    const gerarCodigoSpy = jest.spyOn(workflowEngine, 'gerarCodigo' as any);

    // Execute workflow with gerar_codigo step
    const workflow = {
      name: 'Test Workflow',
      description: 'Test workflow with gerar_codigo step',
      steps: [{ type: 'gerar_codigo', config: config }],
    };

    // Mock loadWorkflow and runWorkflow methods
    jest.spyOn(workflowEngine, 'loadWorkflow' as any).mockResolvedValue(workflow);
    jest.spyOn(workflowEngine, 'validateWorkflow' as any).mockImplementation(() => {});

    await workflowEngine.executeWorkflow('test-workflow.yaml');

    // Assert that gerarCodigo method was called with correct config
    expect(gerarCodigoSpy).toHaveBeenCalledWith(config);

    // Assert that output file was created with correct content
    const outputFileContent = fs.readFileSync(outputPath, 'utf8');
    expect(outputFileContent).toBe('Hello Test, value: 123');

    // Clean up
    fs.unlinkSync(templatePath);
    fs.unlinkSync(outputPath);
  });
});