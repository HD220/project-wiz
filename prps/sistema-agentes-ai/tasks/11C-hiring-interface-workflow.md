# Task 11C: Hiring Interface & Workflow - Enhanced

## Overview

Create a comprehensive frontend interface for the intelligent agent hiring system, including a wizard-based hiring flow, candidate selection interface, and complete hiring workflow. This micro-task delivers the user-facing components that make agent hiring intuitive and efficient.

## User Value

After completing this task, users can:
- Navigate an intuitive step-by-step hiring wizard
- Review AI-generated candidates with detailed profiles and match scores
- Customize agent profiles before hiring
- Monitor hiring progress with real-time status updates
- Experience a seamless end-to-end hiring workflow
- Manage their hiring history and agent team

## Technical Requirements

### Prerequisites
- Task 11A: Project Analysis & Database Foundation completed
- Task 11B: AI Candidate Generation System completed
- Existing agent creation service operational
- Frontend component library (Shadcn/ui) available
- File picker functionality for project selection

### Extended Database Schema

```sql
-- Agent hiring history for analytics and tracking
CREATE TABLE agent_hirings (
    id TEXT PRIMARY KEY,
    job_posting_id TEXT NOT NULL REFERENCES agent_job_postings(id),
    candidate_id TEXT NOT NULL REFERENCES agent_candidates(id),
    hired_agent_id TEXT NOT NULL REFERENCES agents(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    
    -- Hiring details
    hiring_reason TEXT, -- Why this candidate was chosen
    customizations_made TEXT, -- JSON with any modifications made
    initial_feedback TEXT, -- User's first impressions
    
    -- Performance tracking (for future analytics)
    performance_rating INTEGER, -- 1-5 stars after some usage
    performance_notes TEXT,
    would_recommend BOOLEAN,
    
    hired_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Performance indexes
CREATE INDEX agent_hirings_user_id_idx ON agent_hirings(user_id);
CREATE INDEX agent_hirings_hired_agent_idx ON agent_hirings(hired_agent_id);
CREATE INDEX agent_hirings_job_posting_idx ON agent_hirings(job_posting_id);
```

### Core Types

```typescript
export interface HiringRequest {
  title: string;
  description: string;
  requirements: string[];
  preferredSkills?: string[];
  urgency?: UrgencyLevel;
  deadline?: Date;
  projectContext?: ProjectContext;
}

export interface AgentHiring {
  id: string;
  jobPostingId: string;
  candidateId: string;
  hiredAgentId: string;
  userId: string;
  hiringReason?: string;
  customizationsMade?: Record<string, any>;
  initialFeedback?: string;
  performanceRating?: number;
  performanceNotes?: string;
  wouldRecommend?: boolean;
  hiredAt: Date;
  updatedAt: Date;
}

export interface CandidateCustomization {
  name?: string;
  personality?: string;
  instructions?: string;
  modelParameters?: Record<string, any>;
}
```

## Implementation Steps

### 1. Extended Database Schema and Service

```typescript
// Update src/main/agents/hiring/hiring.schema.ts
export const agentHiringsTable = sqliteTable('agent_hirings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobPostingId: text('job_posting_id').notNull().references(() => agentJobPostingsTable.id),
  candidateId: text('candidate_id').notNull().references(() => agentCandidatesTable.id),
  hiredAgentId: text('hired_agent_id').notNull().references(() => agentsTable.id),
  userId: text('user_id').notNull().references(() => usersTable.id),
  
  hiringReason: text('hiring_reason'),
  customizationsMade: text('customizations_made'), // JSON
  initialFeedback: text('initial_feedback'),
  
  performanceRating: integer('performance_rating'),
  performanceNotes: text('performance_notes'),
  wouldRecommend: integer('would_recommend', { mode: 'boolean' }),
  
  hiredAt: integer('hired_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Performance indexes
export const hiringsUserIndex = index('agent_hirings_user_id_idx')
  .on(agentHiringsTable.userId);
export const hiringsAgentIndex = index('agent_hirings_hired_agent_idx')
  .on(agentHiringsTable.hiredAgentId);
export const hiringsJobPostingIndex = index('agent_hirings_job_posting_idx')
  .on(agentHiringsTable.jobPostingId);

// Type inference
export type SelectAgentHiring = typeof agentHiringsTable.$inferSelect;
export type InsertAgentHiring = typeof agentHiringsTable.$inferInsert;
```

### 2. Hiring Service

```typescript
// src/main/agents/hiring/agent-hiring.service.ts
import { eq, and, desc } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { 
  agentCandidatesTable, 
  agentHiringsTable 
} from './hiring.schema';
import { AgentService } from '../agent.service';
import { CandidateGenerationService } from './candidate-generation.service';
import type { 
  AgentHiring, 
  CandidateCustomization,
  InsertAgentHiring,
  SelectAgentHiring 
} from './hiring.types';

export class AgentHiringService {
  // Hire a candidate and create actual agent
  static async hireCandidate(
    candidateId: string,
    userId: string,
    llmProviderId: string,
    customizations?: CandidateCustomization,
    hiringReason?: string
  ): Promise<AgentHiring> {
    const db = getDatabase();

    // Get candidate details
    const candidates = await CandidateGenerationService.getCandidatesForJob('');
    const candidate = candidates.find(c => c.id === candidateId);

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    if (candidate.status !== 'candidate') {
      throw new Error('Candidate is no longer available');
    }

    // Validate LLM provider exists
    // TODO: Add LLM provider validation

    // Create actual agent with customizations
    const agentData = {
      name: customizations?.name || candidate.suggestedName,
      role: candidate.suggestedRole,
      personality: customizations?.personality || candidate.personality,
      backstory: candidate.backstory,
      instructions: customizations?.instructions || candidate.instructions,
      userId,
      llmProviderId,
      modelParameters: JSON.stringify(customizations?.modelParameters || candidate.modelParameters),
    };

    const newAgent = await AgentService.create(agentData, userId);

    // Update candidate status
    await CandidateGenerationService.updateCandidateStatus(candidateId, 'hired', newAgent.id);

    // Create hiring record
    const hiringData: InsertAgentHiring = {
      jobPostingId: candidate.jobPostingId,
      candidateId,
      hiredAgentId: newAgent.id,
      userId,
      hiringReason,
      customizationsMade: customizations ? JSON.stringify(customizations) : null,
    };

    const [hiring] = await db
      .insert(agentHiringsTable)
      .values(hiringData)
      .returning();

    if (!hiring) {
      throw new Error('Failed to create hiring record');
    }

    return this.parseHiring(hiring);
  }

  // Get user hiring history
  static async getUserHirings(userId: string): Promise<AgentHiring[]> {
    const db = getDatabase();

    const hirings = await db
      .select()
      .from(agentHiringsTable)
      .where(eq(agentHiringsTable.userId, userId))
      .orderBy(desc(agentHiringsTable.hiredAt));

    return hirings.map(hiring => this.parseHiring(hiring));
  }

  // Update hiring feedback
  static async updateHiringFeedback(
    hiringId: string,
    userId: string,
    feedback: {
      initialFeedback?: string;
      performanceRating?: number;
      performanceNotes?: string;
      wouldRecommend?: boolean;
    }
  ): Promise<void> {
    const db = getDatabase();

    await db
      .update(agentHiringsTable)
      .set({
        ...feedback,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(agentHiringsTable.id, hiringId),
          eq(agentHiringsTable.userId, userId)
        )
      );
  }

  // Get hiring analytics
  static async getHiringAnalytics(userId: string): Promise<{
    totalHired: number;
    averageMatchScore: number;
    mostHiredRoles: Array<{ role: string; count: number }>;
    satisfactionRate: number;
  }> {
    const db = getDatabase();

    const hirings = await this.getUserHirings(userId);
    const totalHired = hirings.length;

    if (totalHired === 0) {
      return {
        totalHired: 0,
        averageMatchScore: 0,
        mostHiredRoles: [],
        satisfactionRate: 0,
      };
    }

    // Calculate analytics (simplified implementation)
    const satisfactionRatings = hirings
      .filter(h => h.performanceRating)
      .map(h => h.performanceRating!);

    const satisfactionRate = satisfactionRatings.length > 0
      ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length / 5 * 100
      : 0;

    return {
      totalHired,
      averageMatchScore: 85, // TODO: Calculate from actual candidate match scores
      mostHiredRoles: [
        { role: 'Full-Stack Developer', count: Math.floor(totalHired * 0.4) },
        { role: 'Frontend Specialist', count: Math.floor(totalHired * 0.3) },
        { role: 'Backend Developer', count: Math.floor(totalHired * 0.3) },
      ],
      satisfactionRate: Math.round(satisfactionRate),
    };
  }

  private static parseHiring(dbHiring: any): AgentHiring {
    return {
      ...dbHiring,
      customizationsMade: dbHiring.customizationsMade ? JSON.parse(dbHiring.customizationsMade) : undefined,
      hiredAt: new Date(dbHiring.hiredAt),
      updatedAt: new Date(dbHiring.updatedAt),
    };
  }
}
```

### 3. Hiring Wizard Component

```typescript
// src/renderer/components/hiring/hiring-wizard.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, Sparkles, FolderOpen, Brain, Clock, 
  CheckCircle, ArrowRight, ArrowLeft, Wand2 
} from 'lucide-react';
import { useAgentStore } from '@/store/agent-store';
import type { HiringRequest, AgentJobPosting, ProjectAnalysis } from '@/types/hiring';

const hiringSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().min(1, 'Requirements are required'),
  preferredSkills: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']),
  projectPath: z.string().optional(),
});

interface HiringWizardProps {
  onJobCreated: (job: AgentJobPosting) => void;
}

export function HiringWizard({ onJobCreated }: HiringWizardProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [projectAnalysis, setProjectAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm({
    resolver: zodResolver(hiringSchema),
    defaultValues: {
      urgency: 'medium',
    },
  });

  const steps = [
    { number: 1, title: 'Job Details', description: 'Describe what you need' },
    { number: 2, title: 'Project Analysis', description: 'AI analyzes your project' },
    { number: 3, title: 'Review & Post', description: 'Confirm and create job' },
  ];

  const onSubmit = async (data: any) => {
    setIsCreating(true);
    try {
      const request: HiringRequest = {
        title: data.title,
        description: data.description,
        requirements: data.requirements.split(',').map((r: string) => r.trim()).filter(Boolean),
        preferredSkills: data.preferredSkills ? 
          data.preferredSkills.split(',').map((s: string) => s.trim()).filter(Boolean) : 
          undefined,
        urgency: data.urgency,
        projectContext: data.projectPath ? { projectPath: data.projectPath } : undefined,
      };

      const response = await window.api.hiring.createJobPosting(request);
      
      if (response.success) {
        onJobCreated(response.data);
        toast({
          title: 'Job Posted Successfully!',
          description: 'AI is analyzing requirements and generating candidates.',
        });
        setOpen(false);
        resetWizard();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Failed to Create Job',
        description: error instanceof Error ? error.message : 'Failed to create job posting',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetWizard = () => {
    form.reset();
    setCurrentStep(1);
    setProjectAnalysis(null);
    setIsAnalyzing(false);
  };

  const handleProjectSelection = async () => {
    try {
      setIsAnalyzing(true);
      
      // Use file picker to select project directory
      const result = await window.electronAPI.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Project Directory',
      });

      if (!result.canceled && result.filePaths[0]) {
        form.setValue('projectPath', result.filePaths[0]);
        
        toast({
          title: 'Analyzing Project...',
          description: 'AI is scanning your project structure.',
        });
        
        const analysisResponse = await window.api.hiring.analyzeProject(result.filePaths[0]);
        if (analysisResponse.success) {
          const analysis = analysisResponse.data;
          setProjectAnalysis(analysis);
          
          // Auto-fill requirements based on analysis
          const autoRequirements = [
            ...analysis.technologyStack.slice(0, 8),
            ...analysis.missingSkills.slice(0, 3),
          ].join(', ');
          
          const autoPreferredSkills = analysis.recommendedRoles.slice(0, 5).join(', ');
          
          if (autoRequirements) {
            form.setValue('requirements', autoRequirements);
          }
          if (autoPreferredSkills) {
            form.setValue('preferredSkills', autoPreferredSkills);
          }
          
          toast({
            title: 'Project Analyzed Successfully!',
            description: `Found ${analysis.technologyStack.length} technologies. Requirements auto-filled.`,
          });
          
          setCurrentStep(3); // Skip to review step
        }
      }
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze project. You can still proceed manually.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Hire AI Agent
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Intelligent Agent Hiring
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress Indicator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step.number <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step.number < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Job Details */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Describe Your Needs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Senior React Developer for E-commerce Platform" />
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
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe your project, goals, and what kind of help you need..."
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Skills (comma-separated)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="React, TypeScript, Node.js, API integration..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preferredSkills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Skills (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Next.js, Tailwind CSS, Jest, AWS..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Urgency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low - Can wait a few days</SelectItem>
                            <SelectItem value="medium">Medium - Need within a day</SelectItem>
                            <SelectItem value="high">High - Need ASAP</SelectItem>
                            <SelectItem value="urgent">Urgent - Critical blocker</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Project Analysis */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    AI Project Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Let AI analyze your project structure to generate better agent recommendations
                    </p>
                    
                    <Button
                      type="button"
                      onClick={handleProjectSelection}
                      disabled={isAnalyzing}
                      className="gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          Analyzing Project...
                        </>
                      ) : (
                        <>
                          <FolderOpen className="h-4 w-4" />
                          Select Project Directory
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {form.watch('projectPath') && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Selected Project:</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {form.watch('projectPath')}
                      </p>
                    </div>
                  )}

                  {projectAnalysis && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Analysis Results:</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Technology Stack</h5>
                          <div className="flex flex-wrap gap-1">
                            {projectAnalysis.technologyStack.slice(0, 8).map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {projectAnalysis.technologyStack.length > 8 && (
                              <Badge variant="outline" className="text-xs">
                                +{projectAnalysis.technologyStack.length - 8}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Project Details</h5>
                          <div className="space-y-1 text-sm">
                            <p>Type: <span className="font-medium capitalize">{projectAnalysis.projectType}</span></p>
                            <p>Complexity: <span className="font-medium">{projectAnalysis.complexityScore}/10</span></p>
                            <p>Phase: <span className="font-medium capitalize">{projectAnalysis.developmentPhase}</span></p>
                          </div>
                        </div>
                      </div>
                      
                      {projectAnalysis.recommendedRoles.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Recommended Roles</h5>
                          <div className="flex flex-wrap gap-1">
                            {projectAnalysis.recommendedRoles.slice(0, 6).map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Analysis Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Auto-fills requirements based on detected technologies</li>
                      <li>• Generates candidates optimized for your tech stack</li>
                      <li>• Provides role recommendations based on project complexity</li>
                      <li>• Identifies missing skills and team gaps</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Review & Post */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Review & Post Job
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Job Title</h4>
                      <p className="text-sm text-muted-foreground">{form.watch('title')}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Description</h4>
                      <p className="text-sm text-muted-foreground">{form.watch('description')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">Required Skills</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {form.watch('requirements')?.split(',').map((req: string, index: number) => (
                            <Badge key={index} variant="default" className="text-xs">
                              {req.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Preferred Skills</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {form.watch('preferredSkills')?.split(',').filter(Boolean).map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill.trim()}
                            </Badge>
                          )) || <span className="text-sm text-muted-foreground">None specified</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span>Urgency: <Badge variant="secondary">{form.watch('urgency')}</Badge></span>
                      {form.watch('projectPath') && (
                        <span>Project Analysis: <Badge variant="default">✓ Enabled</Badge></span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ul className="text-sm space-y-1">
                      <li>• AI analyzes your requirements and project context</li>
                      <li>• Generates 4-6 diverse agent candidates with different specializations</li>
                      <li>• Provides match scores and detailed reasoning for each candidate</li>
                      <li>• You can review, customize, and hire your preferred candidates</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Navigation */}
            <div className="flex justify-between">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isCreating} className="gap-2">
                    {isCreating ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Creating Job...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Post Job & Generate Candidates
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Candidate Browser Component

```typescript
// src/renderer/components/hiring/candidate-browser.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, User, Brain, Target, CheckCircle, Clock, 
  Settings, Sparkles, Award, TrendingUp 
} from 'lucide-react';
import { useLlmProviderStore } from '@/store/llm-provider-store';
import type { AgentCandidate, AgentJobPosting, CandidateCustomization } from '@/types/hiring';

interface CandidateBrowserProps {
  jobPosting: AgentJobPosting;
  onCandidateHired: (candidate: AgentCandidate) => void;
}

export function CandidateBrowser({ jobPosting, onCandidateHired }: CandidateBrowserProps) {
  const { toast } = useToast();
  const { providers } = useLlmProviderStore();
  const [candidates, setCandidates] = useState<AgentCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<AgentCandidate | null>(null);
  const [customizations, setCustomizations] = useState<CandidateCustomization>({});
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [hiringReason, setHiringReason] = useState('');
  const [isHiring, setIsHiring] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, [jobPosting.id]);

  useEffect(() => {
    // Set default provider
    if (providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0].id);
    }
  }, [providers, selectedProvider]);

  const loadCandidates = async () => {
    try {
      const response = await window.api.hiring.getCandidates(jobPosting.id);
      if (response.success) {
        setCandidates(response.data);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Failed to Load Candidates',
        description: error instanceof Error ? error.message : 'Failed to load candidates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHireCandidate = async (candidate: AgentCandidate) => {
    if (!selectedProvider) {
      toast({
        title: 'Provider Required',
        description: 'Please select an LLM provider for this agent.',
        variant: 'destructive',
      });
      return;
    }

    setIsHiring(true);
    try {
      const response = await window.api.hiring.hireCandidate(
        candidate.id,
        selectedProvider,
        customizations,
        hiringReason || `Selected for strong match (${candidate.matchScore}%) with project requirements`
      );

      if (response.success) {
        onCandidateHired(candidate);
        toast({
          title: 'Agent Hired Successfully! 🎉',
          description: `${customizations.name || candidate.suggestedName} has been added to your team.`,
        });
        setSelectedCandidate(null);
        loadCandidates(); // Refresh to show hired status
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Hiring Failed',
        description: error instanceof Error ? error.message : 'Failed to hire candidate',
        variant: 'destructive',
      });
    } finally {
      setIsHiring(false);
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 animate-spin" />
          <span>AI is generating perfect candidates for you...</span>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-40" />
          </Card>
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No candidates generated yet. AI is still analyzing your requirements.
          </p>
          <Button 
            variant="outline" 
            onClick={loadCandidates}
            className="mt-4"
          >
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Generated Candidates
          </h3>
          <p className="text-sm text-muted-foreground">
            {candidates.length} candidates tailored for "{jobPosting.title}"
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>Average Match: {Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)}%</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {candidates.map((candidate) => (
          <Card 
            key={candidate.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              candidate.status === 'hired' ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {candidate.suggestedName}
                    {candidate.status === 'hired' && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Hired
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {candidate.suggestedRole}
                  </p>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{candidate.matchScore}/100</span>
                  </div>
                  <Badge className={`text-xs ${getExperienceColor(candidate.experienceLevel)}`}>
                    {candidate.experienceLevel}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {candidate.reasoning}
                </p>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-2">CORE SKILLS</h5>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{candidate.skills.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
              
              {candidate.strengths.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">KEY STRENGTHS</h5>
                  <div className="flex flex-wrap gap-1">
                    {candidate.strengths.slice(0, 3).map((strength) => (
                      <Badge key={strength} variant="outline" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Project Match</span>
                  <span className="font-medium">{candidate.matchScore}%</span>
                </div>
                <Progress value={candidate.matchScore} className="h-1" />
              </div>
              
              {candidate.status === 'candidate' ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full gap-2"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setCustomizations({
                          name: candidate.suggestedName,
                          personality: candidate.personality,
                          instructions: candidate.instructions,
                          modelParameters: candidate.modelParameters,
                        });
                        setHiringReason('');
                      }}
                    >
                      <User className="h-4 w-4" />
                      Hire This Agent
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Hire {candidate.suggestedName}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Candidate Summary */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Candidate Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Role:</span>
                              <span className="ml-2 font-medium">{candidate.suggestedRole}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Experience:</span>
                              <span className="ml-2 font-medium capitalize">{candidate.experienceLevel}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Match Score:</span>
                              <span className="ml-2 font-medium">{candidate.matchScore}/100</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Provider:</span>
                              <span className="ml-2 font-medium capitalize">{candidate.recommendedProviderType}</span>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground text-sm">Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {candidate.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-muted-foreground text-sm">Backstory:</span>
                            <p className="text-sm mt-1">{candidate.backstory}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Customization Options */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Customize Agent
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Agent Name</label>
                            <Input
                              value={customizations.name || ''}
                              onChange={(e) => setCustomizations(prev => ({ ...prev, name: e.target.value }))}
                              placeholder={candidate.suggestedName}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">LLM Provider</label>
                            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                              <SelectContent>
                                {providers.map((provider) => (
                                  <SelectItem key={provider.id} value={provider.id}>
                                    {provider.name} ({provider.type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Personality</label>
                            <Textarea
                              value={customizations.personality || ''}
                              onChange={(e) => setCustomizations(prev => ({ ...prev, personality: e.target.value }))}
                              placeholder={candidate.personality}
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Instructions</label>
                            <Textarea
                              value={customizations.instructions || ''}
                              onChange={(e) => setCustomizations(prev => ({ ...prev, instructions: e.target.value }))}
                              placeholder={candidate.instructions}
                              rows={4}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Hiring Reason (optional)</label>
                            <Textarea
                              value={hiringReason}
                              onChange={(e) => setHiringReason(e.target.value)}
                              placeholder="Why did you choose this candidate?"
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => handleHireCandidate(candidate)}
                          disabled={isHiring || !selectedProvider}
                          className="gap-2"
                        >
                          {isHiring ? (
                            <>
                              <Clock className="h-4 w-4 animate-spin" />
                              Hiring...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Confirm Hire
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button variant="secondary" className="w-full" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Already Hired
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 5. Enhanced IPC Handlers

```typescript
// Update src/main/agents/hiring/hiring.handlers.ts
import { AgentHiringService } from './agent-hiring.service';

export function setupHiringHandlers(): void {
  // ... existing handlers from 11A and 11B ...

  // Hire candidate
  ipcMain.handle(
    'hiring:hireCandidate',
    async (_, candidateId: string, llmProviderId: string, customizations?: any, hiringReason?: string): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id'; // TODO: Get from auth system
        const hiring = await AgentHiringService.hireCandidate(
          candidateId,
          userId,
          llmProviderId,
          customizations,
          hiringReason
        );
        return { success: true, data: hiring };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to hire candidate',
        };
      }
    }
  );

  // Get user hirings
  ipcMain.handle(
    'hiring:getUserHirings',
    async (): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const hirings = await AgentHiringService.getUserHirings(userId);
        return { success: true, data: hirings };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get hiring history',
        };
      }
    }
  );

  // Get hiring analytics
  ipcMain.handle(
    'hiring:getHiringAnalytics',
    async (): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const analytics = await AgentHiringService.getHiringAnalytics(userId);
        return { success: true, data: analytics };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get hiring analytics',
        };
      }
    }
  );

  // Update hiring feedback
  ipcMain.handle(
    'hiring:updateHiringFeedback',
    async (_, hiringId: string, feedback: any): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        await AgentHiringService.updateHiringFeedback(hiringId, userId, feedback);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update hiring feedback',
        };
      }
    }
  );
}
```

### 6. Frontend API Integration

```typescript
// Update src/renderer/preload.ts
hiring: {
  analyzeProject: (projectPath: string) => 
    ipcRenderer.invoke('hiring:analyzeProject', projectPath),
  createJobPosting: (input: any) => 
    ipcRenderer.invoke('hiring:createJobPosting', input),
  getUserJobPostings: () => 
    ipcRenderer.invoke('hiring:getUserJobPostings'),
  getCandidates: (jobPostingId: string) => 
    ipcRenderer.invoke('hiring:getCandidates', jobPostingId),
  hireCandidate: (candidateId: string, llmProviderId: string, customizations?: any, hiringReason?: string) => 
    ipcRenderer.invoke('hiring:hireCandidate', candidateId, llmProviderId, customizations, hiringReason),
  getUserHirings: () => 
    ipcRenderer.invoke('hiring:getUserHirings'),
  getHiringAnalytics: () => 
    ipcRenderer.invoke('hiring:getHiringAnalytics'),
  updateHiringFeedback: (hiringId: string, feedback: any) => 
    ipcRenderer.invoke('hiring:updateHiringFeedback', hiringId, feedback),
}

// Update src/renderer/window.d.ts
hiring: {
  analyzeProject: (projectPath: string) => Promise<IpcResponse>;
  createJobPosting: (input: any) => Promise<IpcResponse>;
  getUserJobPostings: () => Promise<IpcResponse>;
  getCandidates: (jobPostingId: string) => Promise<IpcResponse>;
  hireCandidate: (candidateId: string, llmProviderId: string, customizations?: any, hiringReason?: string) => Promise<IpcResponse>;
  getUserHirings: () => Promise<IpcResponse>;
  getHiringAnalytics: () => Promise<IpcResponse>;
  updateHiringFeedback: (hiringId: string, feedback: any) => Promise<IpcResponse>;
};
```

## Validation Checkpoints

### Checkpoint 1: Hiring Wizard
- Test step-by-step wizard navigation
- Verify project analysis integration
- Test auto-filling requirements from analysis
- Validate form validation and error handling

### Checkpoint 2: Candidate Selection
- Test candidate browsing and filtering
- Verify candidate customization workflow
- Test LLM provider selection
- Validate hiring confirmation process

### Checkpoint 3: Complete Workflow
- Test end-to-end hiring process
- Verify agent creation after hiring
- Test hiring history and analytics
- Validate status updates and notifications

## Success Criteria

✅ **Intuitive Interface**: Step-by-step wizard guides users through hiring process
✅ **Rich Candidate Profiles**: Detailed candidate information with match scores and reasoning
✅ **Customization Options**: Full control over agent configuration before hiring
✅ **Seamless Integration**: Complete integration with agent creation system
✅ **User Feedback**: Clear status updates and confirmation throughout process

## Next Steps

After completing the hiring interface:
1. **Analytics Dashboard**: Detailed hiring success metrics and insights
2. **Bulk Operations**: Hire multiple candidates or create team compositions
3. **Template System**: Save and reuse common hiring configurations

This task completes the intelligent agent hiring system by providing an intuitive, comprehensive interface that makes hiring AI agents as easy as browsing and selecting from a curated marketplace of talent.