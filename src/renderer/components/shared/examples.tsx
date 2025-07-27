/**
 * Usage examples for shared compound components
 *
 * These examples demonstrate the proper usage patterns for the compound components
 * following the INLINE-FIRST principles and design system patterns.
 */

import { User, Settings, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { FeatureCard, StatusIndicator, DataDisplay } from "./index";

// FeatureCard Examples
export function FeatureCardExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">FeatureCard Examples</h2>

      {/* Basic usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Usage</h3>
        <FeatureCard.Root variant="default">
          <FeatureCard.Header>
            <div className="flex items-start gap-3">
              <FeatureCard.Icon>
                <User className="h-4 w-4" />
              </FeatureCard.Icon>
              <div className="space-y-1">
                <FeatureCard.Title>Agent Management</FeatureCard.Title>
                <FeatureCard.Description>
                  Create and manage AI agents for your projects
                </FeatureCard.Description>
              </div>
            </div>
          </FeatureCard.Header>
          <FeatureCard.Footer>
            <FeatureCard.Meta>Last updated 2 hours ago</FeatureCard.Meta>
            <FeatureCard.Action>
              <Button size="sm">Configure</Button>
            </FeatureCard.Action>
          </FeatureCard.Footer>
        </FeatureCard.Root>
      </div>

      {/* Highlighted variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Highlighted Variant</h3>
        <FeatureCard.Root variant="highlighted" interactive>
          <FeatureCard.Header>
            <div className="flex items-start gap-3">
              <FeatureCard.Icon>
                <Activity className="h-5 w-5" />
              </FeatureCard.Icon>
              <div className="space-y-1">
                <FeatureCard.Title>Premium Feature</FeatureCard.Title>
                <FeatureCard.Description>
                  Advanced analytics and monitoring capabilities
                </FeatureCard.Description>
              </div>
            </div>
          </FeatureCard.Header>
          <FeatureCard.Content>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Real-time performance metrics</li>
              <li>• Advanced reporting dashboard</li>
              <li>• Custom alerting rules</li>
            </ul>
          </FeatureCard.Content>
          <FeatureCard.Footer>
            <FeatureCard.Meta>✨ Premium</FeatureCard.Meta>
            <FeatureCard.Action>
              <Button>Get Started</Button>
            </FeatureCard.Action>
          </FeatureCard.Footer>
        </FeatureCard.Root>
      </div>

      {/* Compact variant */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Compact Variant</h3>
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard.Root variant="compact">
            <FeatureCard.Content>
              <div className="flex items-center gap-2">
                <FeatureCard.Icon>
                  <Settings className="h-4 w-4" />
                </FeatureCard.Icon>
                <div>
                  <FeatureCard.Title>Settings</FeatureCard.Title>
                  <FeatureCard.Description>
                    Configure app preferences
                  </FeatureCard.Description>
                </div>
              </div>
            </FeatureCard.Content>
          </FeatureCard.Root>

          <FeatureCard.Root variant="compact">
            <FeatureCard.Content>
              <div className="flex items-center gap-2">
                <FeatureCard.Icon>
                  <AlertCircle className="h-4 w-4" />
                </FeatureCard.Icon>
                <div>
                  <FeatureCard.Title>Alerts</FeatureCard.Title>
                  <FeatureCard.Description>
                    System notifications
                  </FeatureCard.Description>
                </div>
              </div>
            </FeatureCard.Content>
          </FeatureCard.Root>
        </div>
      </div>
    </div>
  );
}

// StatusIndicator Examples
export function StatusIndicatorExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">StatusIndicator Examples</h2>

      {/* Basic status indicators */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Status Indicators</h3>
        <div className="flex flex-wrap gap-4">
          <StatusIndicator.Active />
          <StatusIndicator.Inactive />
          <StatusIndicator.Loading />
          <StatusIndicator.Error />
        </div>
      </div>

      {/* Custom compositions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Compositions</h3>
        <div className="space-y-2">
          <StatusIndicator.Root status="active" size="lg">
            <StatusIndicator.Dot />
            <StatusIndicator.Label>Service Running</StatusIndicator.Label>
            <StatusIndicator.Icon asChild>
              <Activity className="h-4 w-4" />
            </StatusIndicator.Icon>
          </StatusIndicator.Root>

          <StatusIndicator.Root status="pending" animated>
            <StatusIndicator.Dot />
            <StatusIndicator.Label>Processing...</StatusIndicator.Label>
          </StatusIndicator.Root>

          <StatusIndicator.Root status="error" size="sm">
            <StatusIndicator.Dot />
            <StatusIndicator.Label>Connection Failed</StatusIndicator.Label>
          </StatusIndicator.Root>
        </div>
      </div>

      {/* Badge variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Badge Variants</h3>
        <div className="flex gap-2">
          <StatusIndicator.Root status="active" variant="badge">
            <StatusIndicator.Badge>Online</StatusIndicator.Badge>
          </StatusIndicator.Root>
          <StatusIndicator.Root status="warning" variant="badge">
            <StatusIndicator.Badge>Warning</StatusIndicator.Badge>
          </StatusIndicator.Root>
          <StatusIndicator.Root status="error" variant="badge">
            <StatusIndicator.Badge>Error</StatusIndicator.Badge>
          </StatusIndicator.Root>
        </div>
      </div>
    </div>
  );
}

// DataDisplay Examples
export function DataDisplayExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">DataDisplay Examples</h2>

      {/* Key-Value List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Key-Value List</h3>
        <DataDisplay.KeyValueList
          title="Agent Details"
          data={[
            { key: "Name", value: "Claude Assistant" },
            { key: "Model", value: "claude-3-5-sonnet", badge: true },
            { key: "Status", value: "Active", badge: true },
            { key: "Created", value: "2 days ago" },
            { key: "Last Active", value: "5 minutes ago" },
          ]}
        />
      </div>

      {/* Statistics Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Statistics Grid</h3>
        <DataDisplay.StatGrid
          columns={3}
          stats={[
            {
              label: "Total Agents",
              value: "12",
              description: "Active AI agents",
            },
            {
              label: "Messages Today",
              value: "1,234",
              description: "Processed messages",
            },
            {
              label: "Success Rate",
              value: "98.5%",
              description: "Last 30 days",
            },
          ]}
        />
      </div>

      {/* Custom DataDisplay composition */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Composition</h3>
        <DataDisplay.Root variant="card">
          <DataDisplay.Header>
            <DataDisplay.Title>Project Statistics</DataDisplay.Title>
            <DataDisplay.Action>
              <Button variant="outline" size="sm">
                Refresh
              </Button>
            </DataDisplay.Action>
          </DataDisplay.Header>

          <DataDisplay.Group title="Performance Metrics">
            <DataDisplay.Item>
              <DataDisplay.Label>Response Time</DataDisplay.Label>
              <DataDisplay.Value>245ms</DataDisplay.Value>
            </DataDisplay.Item>
            <DataDisplay.Item>
              <DataDisplay.Label>Uptime</DataDisplay.Label>
              <DataDisplay.Badge variant="outline">99.9%</DataDisplay.Badge>
            </DataDisplay.Item>
            <DataDisplay.Item>
              <DataDisplay.Label>Error Rate</DataDisplay.Label>
              <DataDisplay.Value>0.1%</DataDisplay.Value>
            </DataDisplay.Item>
          </DataDisplay.Group>

          <DataDisplay.Separator />

          <DataDisplay.Group title="Usage Statistics">
            <DataDisplay.Item>
              <DataDisplay.Label>API Calls</DataDisplay.Label>
              <DataDisplay.Value>15,432</DataDisplay.Value>
            </DataDisplay.Item>
            <DataDisplay.Item>
              <DataDisplay.Label>Active Users</DataDisplay.Label>
              <DataDisplay.Value>89</DataDisplay.Value>
            </DataDisplay.Item>
          </DataDisplay.Group>
        </DataDisplay.Root>
      </div>

      {/* Empty state */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Empty State</h3>
        <DataDisplay.Root variant="card">
          <DataDisplay.Empty
            title="No data available"
            description="Start by creating your first agent to see statistics here."
          >
            <Button className="mt-4">Create Agent</Button>
          </DataDisplay.Empty>
        </DataDisplay.Root>
      </div>
    </div>
  );
}

// Complete example showing integration
export function IntegratedExample() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Integrated Example</h2>
      <p className="text-muted-foreground">
        This example shows how all compound components work together in a
        real-world scenario.
      </p>

      <FeatureCard.Root variant="default" className="max-w-md">
        <FeatureCard.Header>
          <div className="flex items-start justify-between w-full">
            <div className="flex items-start gap-3">
              <FeatureCard.Icon>
                <User className="h-4 w-4" />
              </FeatureCard.Icon>
              <div className="space-y-1">
                <FeatureCard.Title>Claude Assistant</FeatureCard.Title>
                <FeatureCard.Description>
                  AI-powered coding assistant
                </FeatureCard.Description>
              </div>
            </div>
            <StatusIndicator.Active size="sm" />
          </div>
        </FeatureCard.Header>

        <FeatureCard.Content>
          <DataDisplay.Root variant="list" density="compact">
            <DataDisplay.Item>
              <DataDisplay.Label>Model</DataDisplay.Label>
              <DataDisplay.Badge>claude-3-5-sonnet</DataDisplay.Badge>
            </DataDisplay.Item>
            <DataDisplay.Item>
              <DataDisplay.Label>Messages</DataDisplay.Label>
              <DataDisplay.Value>1,234</DataDisplay.Value>
            </DataDisplay.Item>
            <DataDisplay.Item>
              <DataDisplay.Label>Last Active</DataDisplay.Label>
              <DataDisplay.Value>2 minutes ago</DataDisplay.Value>
            </DataDisplay.Item>
          </DataDisplay.Root>
        </FeatureCard.Content>

        <FeatureCard.Footer>
          <FeatureCard.Meta>Created 3 days ago</FeatureCard.Meta>
          <FeatureCard.Action>
            <Button size="sm" variant="outline">
              Configure
            </Button>
          </FeatureCard.Action>
        </FeatureCard.Footer>
      </FeatureCard.Root>
    </div>
  );
}
