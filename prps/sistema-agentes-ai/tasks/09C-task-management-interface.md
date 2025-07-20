# Task 09C: Task Management Interface - Enhanced

## Overview

Create a comprehensive frontend interface for managing agent tasks, monitoring execution progress, and visualizing task queue statistics. This micro-task focuses on delivering an intuitive user experience for the agent task system.

## User Value

After completing this task, users can:
- Create tasks for agents through an intuitive dialog interface
- Monitor real-time task progress with visual indicators
- View comprehensive task queue statistics and worker status
- Manage task lifecycle (cancel, retry, view results)
- Track task history and performance metrics

## Technical Requirements

### Prerequisites
- Task 09A: Task Queue Foundation completed
- Task 09B: Background Worker System completed
- Existing agent management system
- UI component library (Shadcn/ui) available

### Core Components Needed
- Task creation dialog with form validation
- Task list with real-time updates
- Progress monitoring with visual indicators
- Queue statistics dashboard
- Worker status monitoring

## Implementation Steps

### 1. Task Creation Dialog

```typescript
// src/renderer/components/task-queue/task-creation-dialog.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Plus, Brain } from 'lucide-react';
import type { CreateTaskInput } from '@/types/task-queue';

const taskSchema = z.object({
  agentId: z.string().min(1, 'Agent is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().min(20, 'Instructions must be at least 20 characters'),
  priority: z.number().min(1).max(10),
  taskType: z.enum(['general', 'analysis', 'coding', 'research', 'review', 'documentation']),
});

interface TaskCreationDialogProps {
  agents: Array<{ id: string; name: string; role: string }>;
  onTaskCreated: (task: any) => void;
}

export function TaskCreationDialog({ agents, onTaskCreated }: TaskCreationDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 5,
      taskType: 'general',
    },
  });

  const onSubmit = async (data: CreateTaskInput) => {
    setIsCreating(true);
    try {
      const response = await window.api.taskQueue.create(data);
      
      if (response.success) {
        // Automatically queue the task for processing
        await window.api.taskQueue.queueTask(response.data.id);
        
        onTaskCreated(response.data);
        toast({
          title: 'Task Created',
          description: 'Your task has been created and queued for processing.',
        });
        setOpen(false);
        form.reset();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create task',
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
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Create Agent Task
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} - {agent.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="analysis">Analysis</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief task description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Detailed task description and context"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Specific instructions for the agent"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Priority: {field.value}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create & Queue Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Task Management Page

```typescript
// src/renderer/app/agents/tasks/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCreationDialog } from '@/components/task-queue/task-creation-dialog';
import { TaskWorkerStatus } from '@/components/task-queue/worker-status';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Play, Pause, CheckCircle, XCircle, AlertCircle, Settings, Activity } from 'lucide-react';
import type { AgentTask, TaskStatus, TaskWorker } from '@/types/task-queue';

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [workers, setWorkers] = useState<TaskWorker[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus[]>([]);

  useEffect(() => {
    loadTasks();
    loadStats();
    loadWorkers();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      loadTasks();
      loadStats();
      loadWorkers();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedStatus]);

  const loadTasks = async () => {
    try {
      const response = await window.api.taskQueue.getUserTasks({
        status: selectedStatus.length ? selectedStatus : undefined,
        limit: 50,
      });
      
      if (response.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await window.api.taskQueue.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await window.api.taskQueue.getWorkers();
      if (response.success) {
        setWorkers(response.data);
      }
    } catch (error) {
      console.error('Failed to load workers:', error);
    }
  };

  const cancelTask = async (taskId: string) => {
    try {
      const response = await window.api.taskQueue.cancel(taskId);
      if (response.success) {
        loadTasks();
        loadStats();
      }
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
      case 'queued':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Play className="h-4 w-4 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <Pause className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'queued':
        return 'outline';
      case 'running':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Queue</h1>
            <p className="text-muted-foreground">
              Manage and monitor agent background tasks
            </p>
          </div>
          
          <div className="flex gap-2">
            <TaskCreationDialog
              agents={[]} // TODO: Load from agent store
              onTaskCreated={() => {
                loadTasks();
                loadStats();
              }}
            />
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queued</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.queued}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.running}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks" onClick={() => setSelectedStatus([])}>
              All Tasks
            </TabsTrigger>
            <TabsTrigger value="active" onClick={() => setSelectedStatus(['pending', 'queued', 'running'])}>
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setSelectedStatus(['completed'])}>
              Completed
            </TabsTrigger>
            <TabsTrigger value="failed" onClick={() => setSelectedStatus(['failed'])}>
              Failed
            </TabsTrigger>
            <TabsTrigger value="workers">
              Workers ({workers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-24" />
                  </Card>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No tasks found. Create your first task to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            {task.title}
                            <Badge 
                              variant={getStatusColor(task.status as any)}
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(task.status)}
                              {task.status}
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{task.taskType}</span>
                            <span>Priority: {task.priority}</span>
                            <span>
                              Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        {(task.status === 'pending' || task.status === 'queued' || task.status === 'running') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelTask(task.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      
                      {task.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progressPercentage}%</span>
                          </div>
                          <Progress value={task.progressPercentage} />
                          {task.currentStep && (
                            <p className="text-xs text-muted-foreground">
                              Current step: {task.currentStep}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {task.errorMessage && (
                        <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                          <p className="text-sm text-destructive">
                            Error: {task.errorMessage}
                          </p>
                        </div>
                      )}
                      
                      {task.result && (
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-2">Result:</p>
                          <p className="text-sm text-muted-foreground">
                            {task.result.summary}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workers">
            <TaskWorkerStatus workers={workers} onRefresh={loadWorkers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

### 3. Worker Status Component

```typescript
// src/renderer/components/task-queue/worker-status.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TaskWorker } from '@/types/task-queue';

interface TaskWorkerStatusProps {
  workers: TaskWorker[];
  onRefresh: () => void;
}

export function TaskWorkerStatus({ workers, onRefresh }: TaskWorkerStatusProps) {
  const activeWorkers = workers.filter(w => w.isActive);
  const busyWorkers = workers.filter(w => w.currentTaskId);

  return (
    <div className="space-y-6">
      {/* Worker Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkers.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to process tasks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busy Workers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{busyWorkers.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workers.reduce((sum, w) => sum + w.processedTasksCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Worker Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Worker Details</CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No workers running. Background processing may be disabled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workers.map((worker) => (
                <div 
                  key={worker.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Worker {worker.id.slice(-8)}
                      </span>
                      <Badge variant={worker.isActive ? 'default' : 'secondary'}>
                        {worker.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {worker.currentTaskId && (
                        <Badge variant="outline">
                          Processing Task
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>Started {formatDistanceToNow(worker.startedAt, { addSuffix: true })}</span>
                      <span className="mx-2">•</span>
                      <span>Processed {worker.processedTasksCount} tasks</span>
                      <span className="mx-2">•</span>
                      <span>Last seen {formatDistanceToNow(worker.lastHeartbeat, { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {worker.workerPid && (
                      <Badge variant="outline" className="text-xs">
                        PID: {worker.workerPid}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Frontend API Integration

```typescript
// Update src/renderer/preload.ts
taskQueue: {
  create: (input: CreateTaskInput) => 
    ipcRenderer.invoke('task-queue:create', input),
  getUserTasks: (filters?: any) => 
    ipcRenderer.invoke('task-queue:getUserTasks', filters),
  cancel: (taskId: string) => 
    ipcRenderer.invoke('task-queue:cancel', taskId),
  getStats: () => 
    ipcRenderer.invoke('task-queue:getStats'),
  queueTask: (taskId: string) => 
    ipcRenderer.invoke('task-queue:queueTask', taskId),
  getWorkers: () => 
    ipcRenderer.invoke('task-queue:getWorkers'),
  startProcessing: () => 
    ipcRenderer.invoke('task-queue:startProcessing'),
  stopProcessing: () => 
    ipcRenderer.invoke('task-queue:stopProcessing'),
}

// Update src/renderer/window.d.ts
taskQueue: {
  create: (input: CreateTaskInput) => Promise<IpcResponse>;
  getUserTasks: (filters?: any) => Promise<IpcResponse>;
  cancel: (taskId: string) => Promise<IpcResponse>;
  getStats: () => Promise<IpcResponse>;
  queueTask: (taskId: string) => Promise<IpcResponse>;
  getWorkers: () => Promise<IpcResponse>;
  startProcessing: () => Promise<IpcResponse>;
  stopProcessing: () => Promise<IpcResponse>;
};
```

## Validation Checkpoints

### Checkpoint 1: Task Creation
- Verify task creation dialog works with validation
- Test form submission and error handling
- Confirm tasks are created and queued properly

### Checkpoint 2: Real-time Updates
- Test task list updates during execution
- Verify progress indicators work correctly
- Test statistics dashboard updates

### Checkpoint 3: Task Management
- Test task cancellation functionality
- Verify task filtering and pagination
- Test worker status monitoring

## Success Criteria

✅ **Intuitive Creation**: Users can easily create tasks through guided interface
✅ **Real-time Monitoring**: Live updates of task progress and system status
✅ **Comprehensive Dashboard**: Complete overview of queue statistics and worker health
✅ **Task Lifecycle Management**: Full control over task states and operations
✅ **Performance Metrics**: Detailed insights into task processing and worker performance

## Next Steps

After completing this interface:
1. **Enhanced Filtering**: Add advanced task filtering and search capabilities
2. **Bulk Operations**: Support for bulk task operations and management
3. **Analytics Dashboard**: Detailed performance analytics and trends
4. **Integration**: Connect with agent collaboration workflows

This task completes the agent task queue system with a professional, user-friendly interface that provides complete visibility and control over background agent processing.