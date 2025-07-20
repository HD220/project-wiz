# Task 12C: Workflow Builder & Monitoring Interface - Enhanced

## Overview

Create comprehensive frontend interfaces for building multi-agent workflows and monitoring their execution in real-time. This micro-task completes the collaboration system by providing intuitive workflow creation tools, live execution monitoring, and detailed analytics visualization.

## User Value

After completing this task, users can:
- Build complex multi-agent workflows with a visual, intuitive interface
- Monitor workflow execution progress in real-time with detailed agent activity
- View agent interactions and communication during collaborative work
- Access shared knowledge base created during agent collaboration
- Analyze workflow performance and agent collaboration effectiveness
- Create workflows from pre-built templates for common scenarios

## Technical Requirements

### Prerequisites
- Task 12A: Collaboration Foundation & Database completed
- Task 12B: Agent Coordination & Execution completed
- Existing agent management interface
- Shadcn/ui component library available
- TanStack Router for navigation

### Key Interface Components
- Workflow builder with drag-and-drop step creation
- Real-time execution monitor with agent activity visualization
- Agent interaction timeline and communication viewer
- Knowledge base browser and management interface
- Workflow analytics dashboard with performance metrics

## Implementation Steps

### 1. Workflow Builder Component

```typescript
// src/renderer/components/collaboration/workflow-builder.tsx
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Play, Users, Workflow, ArrowDown, ArrowRight, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CreateWorkflowRequest, WorkflowStep } from '@/types/collaboration';

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  workflowType: z.enum(['pipeline', 'parallel', 'conditional']),
  participatingAgents: z.array(z.string()).min(2, 'At least 2 agents required'),
  coordinatorAgentId: z.string().optional(),
});

const stepTypes = [
  { value: 'analysis', label: 'Analysis', description: 'Research, investigation, or data analysis' },
  { value: 'implementation', label: 'Implementation', description: 'Code development or task execution' },
  { value: 'review', label: 'Review', description: 'Quality assurance and validation' },
  { value: 'testing', label: 'Testing', description: 'Testing and verification' },
  { value: 'documentation', label: 'Documentation', description: 'Writing documentation or reports' },
  { value: 'coordination', label: 'Coordination', description: 'Team coordination and planning' },
  { value: 'decision', label: 'Decision', description: 'Decision making and approval' },
];

interface WorkflowBuilderProps {
  agents: Array<{ id: string; name: string; role: string }>;
  templates: Array<{ id: string; name: string; description: string; category: string }>;
  onWorkflowCreated: (workflow: any) => void;
}

export function WorkflowBuilder({ agents, templates, onWorkflowCreated }: WorkflowBuilderProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const form = useForm<CreateWorkflowRequest>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      workflowType: 'pipeline',
      participatingAgents: [],
    },
  });

  const addStep = useCallback(() => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: '',
      description: '',
      type: 'implementation',
      requiredSkills: [],
      dependsOn: [],
      canRunInParallel: false,
      instructions: '',
      expectedOutput: '',
      timeoutMinutes: 30,
      validationCriteria: [],
      reviewRequired: false,
    };
    setSteps(prev => [...prev, newStep]);
  }, []);

  const updateStep = useCallback((index: number, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, ...updates } : step
    ));
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  }, []);

  const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
    setSteps(prev => {
      const newSteps = [...prev];
      if (direction === 'up' && index > 0) {
        [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      } else if (direction === 'down' && index < newSteps.length - 1) {
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      }
      return newSteps;
    });
  }, []);

  const loadTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await window.api.collaboration.getTemplates();
      if (response.success) {
        const template = response.data.find((t: any) => t.id === templateId);
        if (template) {
          const config = template.templateDefinition;
          form.setValue('name', template.name);
          form.setValue('description', template.description);
          setSteps(config.steps || []);
          
          toast({
            title: 'Template Loaded',
            description: `Loaded workflow template: ${template.name}`,
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Template Load Failed',
        description: 'Failed to load workflow template',
        variant: 'destructive',
      });
    }
  }, [form, toast]);

  const onSubmit = async (data: CreateWorkflowRequest) => {
    if (steps.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one workflow step is required.',
        variant: 'destructive',
      });
      return;
    }

    // Validate step names
    const emptySteps = steps.filter(step => !step.name.trim());
    if (emptySteps.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'All steps must have a name.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const request: CreateWorkflowRequest = {
        ...data,
        configuration: {
          steps,
          coordination: {
            communicationStyle: 'technical',
            decisionMaking: data.coordinatorAgentId ? 'coordinator' : 'consensus',
            knowledgeSharing: true,
          },
          constraints: {
            maxExecutionTime: 3600, // 1 hour
            maxRetries: 3,
            allowParallelExecution: data.workflowType === 'parallel',
          },
        },
      };

      const response = await window.api.collaboration.createWorkflow(request);
      
      if (response.success) {
        onWorkflowCreated(response.data);
        toast({
          title: 'Workflow Created',
          description: 'Your collaboration workflow has been created successfully.',
        });
        setOpen(false);
        form.reset();
        setSteps([]);
        setUseTemplate(false);
        setSelectedTemplate('');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create workflow',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Workflow className="h-4 w-4" />
          Create Workflow
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multi-Agent Workflow Builder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Start From Template</CardTitle>
                <Switch 
                  checked={useTemplate} 
                  onCheckedChange={setUseTemplate}
                />
              </div>
            </CardHeader>
            {useTemplate && (
              <CardContent>
                <Select 
                  value={selectedTemplate} 
                  onValueChange={(value) => {
                    setSelectedTemplate(value);
                    loadTemplate(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a workflow template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            )}
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workflow Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Feature Development Pipeline" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="workflowType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workflow Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pipeline">Pipeline (Sequential)</SelectItem>
                              <SelectItem value="parallel">Parallel Execution</SelectItem>
                              <SelectItem value="conditional">Conditional Branching</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe what this workflow accomplishes..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Agent Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="participatingAgents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Participating Agents</FormLabel>
                        <div className="space-y-2">
                          <Select 
                            onValueChange={(value) => {
                              if (!field.value.includes(value)) {
                                field.onChange([...field.value, value]);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Add agents to workflow" />
                            </SelectTrigger>
                            <SelectContent>
                              {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name} - {agent.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((agentId) => {
                              const agent = agents.find(a => a.id === agentId);
                              return agent ? (
                                <Badge 
                                  key={agent.id} 
                                  variant="secondary"
                                  className="gap-1"
                                >
                                  {agent.name}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => {
                                      field.onChange(field.value.filter(id => id !== agentId));
                                    }}
                                  >
                                    ×
                                  </Button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="coordinatorAgentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coordinator Agent (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a coordinator agent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No coordinator</SelectItem>
                            {form.watch('participatingAgents').map((agentId) => {
                              const agent = agents.find(a => a.id === agentId);
                              return agent ? (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name} - {agent.role}
                                </SelectItem>
                              ) : null;
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Workflow Steps */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Workflow Steps</CardTitle>
                    <Button type="button" onClick={addStep} size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      Add Step
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {steps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No steps defined yet. Click "Add Step" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {steps.map((step, index) => (
                        <div key={step.id}>
                          <Card className="border-dashed">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">Step {index + 1}</Badge>
                                  <Input
                                    value={step.name}
                                    onChange={(e) => updateStep(index, { name: e.target.value })}
                                    placeholder="Step name"
                                    className="w-64"
                                  />
                                  <Select 
                                    value={step.type}
                                    onValueChange={(value) => updateStep(index, { type: value as any })}
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {stepTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveStep(index, 'up')}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveStep(index, 'down')}
                                    disabled={index === steps.length - 1}
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStep(index)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Textarea
                                value={step.description}
                                onChange={(e) => updateStep(index, { description: e.target.value })}
                                placeholder="Describe what this step should accomplish"
                                rows={2}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Required Skills</label>
                                  <Input
                                    value={step.requiredSkills.join(', ')}
                                    onChange={(e) => updateStep(index, { 
                                      requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                    })}
                                    placeholder="React, TypeScript, Testing"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Timeout (minutes)</label>
                                  <Input
                                    type="number"
                                    value={step.timeoutMinutes || 30}
                                    onChange={(e) => updateStep(index, { timeoutMinutes: parseInt(e.target.value) || 30 })}
                                    min={5}
                                    max={480}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Instructions</label>
                                <Textarea
                                  value={step.instructions}
                                  onChange={(e) => updateStep(index, { instructions: e.target.value })}
                                  placeholder="Detailed instructions for the agent executing this step"
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Expected Output</label>
                                <Textarea
                                  value={step.expectedOutput}
                                  onChange={(e) => updateStep(index, { expectedOutput: e.target.value })}
                                  placeholder="Describe what the agent should deliver upon completion"
                                  rows={2}
                                />
                              </div>

                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={step.canRunInParallel}
                                    onCheckedChange={(checked) => updateStep(index, { canRunInParallel: checked })}
                                  />
                                  <label className="text-sm">Can run in parallel</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={step.reviewRequired || false}
                                    onCheckedChange={(checked) => updateStep(index, { reviewRequired: checked })}
                                  />
                                  <label className="text-sm">Requires review</label>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Step Flow Indicator */}
                          {index < steps.length - 1 && (
                            <div className="flex justify-center py-2">
                              {form.watch('workflowType') === 'parallel' ? (
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="gap-2">
                  {isCreating ? (
                    'Creating...'
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Create Workflow
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Execution Monitor Component

```typescript
// src/renderer/components/collaboration/execution-monitor.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, Pause, Square, Users, MessageSquare, Brain, Clock, 
  CheckCircle, XCircle, AlertTriangle, Activity, Zap 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { 
  CollaborationWorkflow, 
  WorkflowExecution, 
  AgentInteraction,
  CollaborationKnowledge 
} from '@/types/collaboration';

interface ExecutionMonitorProps {
  workflow: CollaborationWorkflow;
  onWorkflowStart: (workflowId: string) => void;
}

export function ExecutionMonitor({ workflow, onWorkflowStart }: ExecutionMonitorProps) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [interactions, setInteractions] = useState<AgentInteraction[]>([]);
  const [knowledge, setKnowledge] = useState<CollaborationKnowledge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<string>('');

  useEffect(() => {
    loadExecutions();
    
    // Poll for updates if workflow is active
    if (workflow.status === 'active') {
      const interval = setInterval(() => {
        loadExecutions();
        if (selectedExecution) {
          loadExecutionData(selectedExecution);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [workflow.id, workflow.status]);

  useEffect(() => {
    if (selectedExecution) {
      loadExecutionData(selectedExecution);
    }
  }, [selectedExecution]);

  const loadExecutions = async () => {
    try {
      const response = await window.api.collaboration.getExecutions(workflow.id);
      if (response.success) {
        setExecutions(response.data);
        if (!selectedExecution && response.data.length > 0) {
          setSelectedExecution(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExecutionData = async (executionId: string) => {
    try {
      const [interactionsResponse, knowledgeResponse] = await Promise.all([
        window.api.collaboration.getInteractions(executionId),
        window.api.collaboration.getKnowledge(executionId),
      ]);

      if (interactionsResponse.success) {
        setInteractions(interactionsResponse.data);
      }
      if (knowledgeResponse.success) {
        setKnowledge(knowledgeResponse.data);
      }
    } catch (error) {
      console.error('Failed to load execution data:', error);
    }
  };

  const handleStartWorkflow = async () => {
    onWorkflowStart(workflow.id);
    // Refresh executions after a short delay
    setTimeout(loadExecutions, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'task_delegation':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'knowledge_sharing':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'coordination':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const currentExecution = executions.find(e => e.id === selectedExecution);
  const progressPercentage = workflow.totalSteps > 0 
    ? Math.round((workflow.currentStep / workflow.totalSteps) * 100) 
    : 0;

  const activeInteractions = interactions.filter(i => 
    currentExecution && i.workflowExecutionId === currentExecution.id
  );

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {workflow.name}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                  {getStatusIcon(workflow.status)}
                  {workflow.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {workflow.participatingAgents.length} agents
                </span>
                <span className="text-sm text-muted-foreground">
                  {workflow.configuration.steps.length} steps
                </span>
                {workflow.coordinatorAgentId && (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Coordinated
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {workflow.status === 'draft' && (
                <Button onClick={handleStartWorkflow} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Workflow
                </Button>
              )}
              {workflow.status === 'active' && (
                <Button variant="outline" className="gap-2" disabled>
                  <Pause className="h-4 w-4" />
                  Running...
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {workflow.status === 'active' && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{workflow.currentStep}/{workflow.totalSteps} steps</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Step {workflow.currentStep}</span>
                <span>{progressPercentage}% complete</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Execution Selection */}
      {executions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {executions.map((execution) => (
                <Button
                  key={execution.id}
                  variant={selectedExecution === execution.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedExecution(execution.id)}
                  className="gap-2"
                >
                  {getStatusIcon(execution.status)}
                  Execution #{execution.executionNumber}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Details */}
      {currentExecution && (
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Status</TabsTrigger>
            <TabsTrigger value="interactions">
              Agent Interactions
              <Badge variant="secondary" className="ml-2">
                {activeInteractions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              Team Knowledge
              <Badge variant="secondary" className="ml-2">
                {knowledge.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="steps">Workflow Steps</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(currentExecution.status)}
                  Execution #{currentExecution.executionNumber}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Started {formatDistanceToNow(currentExecution.startedAt, { addSuffix: true })}</span>
                  <span>Trigger: {currentExecution.triggerReason}</span>
                  {currentExecution.completedAt && (
                    <span>
                      Duration: {Math.round(
                        (new Date(currentExecution.completedAt).getTime() - 
                         new Date(currentExecution.startedAt).getTime()) / 1000
                      )}s
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Step */}
                  {currentExecution.currentStepId && (
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        Currently executing: <strong>{currentExecution.currentStepId}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Active Agents */}
                  <div>
                    <h4 className="font-medium mb-2">Active Agents</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentExecution.activeAgents.length > 0 ? (
                        currentExecution.activeAgents.map((agentId) => (
                          <Badge key={agentId} variant="outline" className="gap-1">
                            <Activity className="h-3 w-3" />
                            Agent {agentId.slice(-8)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No agents currently active</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {currentExecution.errorMessage && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Execution Error:</strong> {currentExecution.errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Step Results */}
                  {Object.keys(currentExecution.stepResults).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Completed Steps</h4>
                      <div className="space-y-2">
                        {Object.entries(currentExecution.stepResults).map(([stepId, result]) => (
                          <div key={stepId} className="p-3 border rounded-lg">
                            <div className="font-medium text-sm mb-1">{stepId}</div>
                            <div className="text-sm text-muted-foreground">
                              {typeof result === 'object' ? (result as any).summary || 'Completed' : String(result)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Agent Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeInteractions.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {activeInteractions.map((interaction) => (
                        <div key={interaction.id} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            {getInteractionIcon(interaction.interactionType)}
                            <span className="font-medium text-sm">
                              {interaction.interactionType.replace('_', ' ')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Agent {interaction.fromAgentId.slice(-8)}
                            </Badge>
                            {interaction.toAgentId && (
                              <>
                                <span className="text-xs text-muted-foreground">→</span>
                                <Badge variant="outline" className="text-xs">
                                  Agent {interaction.toAgentId.slice(-8)}
                                </Badge>
                              </>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatDistanceToNow(interaction.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{interaction.message}</p>
                          {interaction.contextData && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer">
                                View context data
                              </summary>
                              <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                                {JSON.stringify(interaction.contextData, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No agent interactions yet. Start the workflow to see communications.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Shared Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                {knowledge.length > 0 ? (
                  <div className="space-y-4">
                    {knowledge.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{item.title}</h4>
                          <Badge variant="outline">{item.knowledgeType}</Badge>
                          <Badge variant="secondary" className="text-xs">
                            Agent {item.createdByAgentId.slice(-8)}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{item.content}</p>
                        {item.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No knowledge items yet. Agents will share insights during collaboration.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflow.configuration.steps.map((step, index) => {
                    const isCompleted = currentExecution.stepResults[step.id];
                    const isCurrent = currentExecution.currentStepId === step.id;
                    const assignedAgent = currentExecution.agentAssignments[step.id];

                    return (
                      <div key={step.id} className={`border rounded-lg p-4 ${
                        isCurrent ? 'border-blue-500 bg-blue-50/50' : ''
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Step {index + 1}</Badge>
                          <h4 className="font-medium">{step.name}</h4>
                          <Badge variant="secondary">{step.type}</Badge>
                          {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {isCurrent && <Activity className="h-4 w-4 text-blue-500 animate-pulse" />}
                          {assignedAgent && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              Agent {assignedAgent.slice(-8)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.requiredSkills.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {step.requiredSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!currentExecution && !isLoading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No executions yet. Start the workflow to begin collaboration.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 3. Frontend API Integration

```typescript
// Update src/renderer/preload.ts
collaboration: {
  createWorkflow: (request: any) => 
    ipcRenderer.invoke('collaboration:createWorkflow', request),
  getUserWorkflows: () => 
    ipcRenderer.invoke('collaboration:getUserWorkflows'),
  getWorkflow: (workflowId: string) => 
    ipcRenderer.invoke('collaboration:getWorkflow', workflowId),
  startWorkflow: (workflowId: string) => 
    ipcRenderer.invoke('collaboration:startWorkflow', workflowId),
  getExecutions: (workflowId: string) => 
    ipcRenderer.invoke('collaboration:getExecutions', workflowId),
  getInteractions: (executionId: string) => 
    ipcRenderer.invoke('collaboration:getInteractions', executionId),
  getKnowledge: (executionId: string) => 
    ipcRenderer.invoke('collaboration:getKnowledge', executionId),
  getTemplates: () => 
    ipcRenderer.invoke('collaboration:getTemplates'),
  createFromTemplate: (templateId: string, participatingAgents: string[], customizations?: any) => 
    ipcRenderer.invoke('collaboration:createFromTemplate', templateId, participatingAgents, customizations),
}

// Update src/renderer/window.d.ts
collaboration: {
  createWorkflow: (request: any) => Promise<IpcResponse>;
  getUserWorkflows: () => Promise<IpcResponse>;
  getWorkflow: (workflowId: string) => Promise<IpcResponse>;
  startWorkflow: (workflowId: string) => Promise<IpcResponse>;
  getExecutions: (workflowId: string) => Promise<IpcResponse>;
  getInteractions: (executionId: string) => Promise<IpcResponse>;
  getKnowledge: (executionId: string) => Promise<IpcResponse>;
  getTemplates: () => Promise<IpcResponse>;
  createFromTemplate: (templateId: string, participatingAgents: string[], customizations?: any) => Promise<IpcResponse>;
};
```

### 4. Collaboration Page

```typescript
// src/renderer/app/collaboration/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowBuilder } from '@/components/collaboration/workflow-builder';
import { ExecutionMonitor } from '@/components/collaboration/execution-monitor';
import { 
  Plus, Workflow, Users, Play, Clock, CheckCircle, XCircle, 
  Search, Filter, Eye 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAgentStore } from '@/store/agent-store';
import type { CollaborationWorkflow, WorkflowTemplate } from '@/types/collaboration';

export default function CollaborationPage() {
  const { agents } = useAgentStore();
  const [workflows, setWorkflows] = useState<CollaborationWorkflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<CollaborationWorkflow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [workflowsResponse, templatesResponse] = await Promise.all([
        window.api.collaboration.getUserWorkflows(),
        window.api.collaboration.getTemplates(),
      ]);

      if (workflowsResponse.success) {
        setWorkflows(workflowsResponse.data);
      }
      if (templatesResponse.success) {
        setTemplates(templatesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkflowCreated = (workflow: CollaborationWorkflow) => {
    setWorkflows(prev => [workflow, ...prev]);
    setSelectedWorkflow(workflow);
  };

  const handleWorkflowStart = async (workflowId: string) => {
    try {
      const response = await window.api.collaboration.startWorkflow(workflowId);
      if (response.success) {
        await loadData(); // Refresh workflows to get updated status
      }
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || workflow.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (selectedWorkflow) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedWorkflow(null)}
            >
              ← Back to Workflows
            </Button>
            <h1 className="text-3xl font-bold">Workflow Execution Monitor</h1>
          </div>
          
          <ExecutionMonitor 
            workflow={selectedWorkflow}
            onWorkflowStart={handleWorkflowStart}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Multi-Agent Collaboration</h1>
            <p className="text-muted-foreground">
              Create and manage workflows where AI agents work together
            </p>
          </div>
          
          <WorkflowBuilder 
            agents={agents}
            templates={templates}
            onWorkflowCreated={handleWorkflowCreated}
          />
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflows.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workflows.filter(w => w.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="workflows" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'draft', 'active', 'completed', 'failed'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Workflows Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkflows.map((workflow) => (
                <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {getStatusIcon(workflow.status)}
                        {workflow.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {workflow.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{workflow.participatingAgents.length} agents</span>
                        <span>•</span>
                        <span>{workflow.configuration.steps.length} steps</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(workflow.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedWorkflow(workflow)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      {workflow.status === 'draft' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWorkflowStart(workflow.id)}
                          className="gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Start
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredWorkflows.length === 0 && !isLoading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No workflows found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first multi-agent workflow to get started'
                    }
                  </p>
                  {!searchTerm && filterStatus === 'all' && (
                    <WorkflowBuilder 
                      agents={agents}
                      templates={templates}
                      onWorkflowCreated={handleWorkflowCreated}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Required Roles:</strong> {template.requiredAgentRoles.join(', ')}
                      </div>
                      <div>
                        <strong>Recommended Team Size:</strong> {template.recommendedAgentCount} agents
                      </div>
                      <div>
                        <strong>Success Rate:</strong> {Math.round(template.successRate)}%
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="mt-4 w-full"
                      disabled={agents.length < template.recommendedAgentCount}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

## Validation Checkpoints

### Checkpoint 1: Workflow Builder Interface
- Test workflow creation with multiple agents and steps
- Verify step configuration and dependencies
- Test template loading and customization
- Validate form validation and error handling

### Checkpoint 2: Execution Monitoring
- Test real-time execution monitoring and progress updates
- Verify agent interaction display and timeline
- Test knowledge base visualization and browsing
- Validate status updates and error reporting

### Checkpoint 3: User Experience
- Test workflow navigation and interface responsiveness
- Verify search and filtering functionality
- Test workflow management operations
- Validate overall user workflow and usability

## Success Criteria

✅ **Intuitive Builder**: Easy-to-use workflow creation with visual step management
✅ **Real-time Monitoring**: Live execution tracking with detailed agent activity
✅ **Rich Interactions**: Complete visibility into agent communications and knowledge sharing
✅ **Template System**: Pre-built workflows for common collaboration scenarios
✅ **Professional Interface**: Polished UI with excellent user experience

## Next Steps

After completing the workflow interface:
1. **Enhanced Analytics**: Add detailed collaboration metrics and performance insights
2. **Advanced Templates**: Create more sophisticated workflow templates
3. **Integration Features**: Connect with external tools and services

This task completes the multi-agent collaboration system by providing comprehensive interfaces for creating, monitoring, and managing complex workflows where AI agents work together effectively as a coordinated team.