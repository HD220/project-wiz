"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function ActivityLog() {
  const [filter, setFilter] = useState("")

  const activities = [
    {
      id: 1,
      timestamp: "2023-06-15T10:42:00",
      action: "Created PR #143: Fix authentication bug in login form",
      type: "pull-request",
      details:
        "Created a pull request to fix the authentication bug on mobile devices. The PR includes changes to the login form validation and API error handling.",
    },
    {
      id: 2,
      timestamp: "2023-06-15T10:30:00",
      action: "Generated API documentation for user endpoints",
      type: "documentation",
      details:
        "Generated comprehensive documentation for the user management API endpoints, including authentication, registration, and profile management.",
    },
    {
      id: 3,
      timestamp: "2023-06-15T10:15:00",
      action: "Analyzed issue #142: Authentication not working on mobile",
      type: "issue",
      details:
        "Analyzed the authentication issue on mobile devices. Identified the root cause as improper handling of token expiration on slow network connections.",
    },
    {
      id: 4,
      timestamp: "2023-06-15T09:58:00",
      action: "Updated README.md with installation instructions",
      type: "documentation",
      details:
        "Updated the README.md file with detailed installation instructions for different operating systems and environments.",
    },
    {
      id: 5,
      timestamp: "2023-06-15T09:45:00",
      action: "Created branch fix/auth-mobile-142 from main",
      type: "branch",
      details:
        "Created a new branch 'fix/auth-mobile-142' from the main branch to address the authentication issue on mobile devices.",
    },
    {
      id: 6,
      timestamp: "2023-06-15T09:30:00",
      action: "Reviewed code in file src/auth/login.ts",
      type: "code-review",
      details:
        "Reviewed the authentication code in src/auth/login.ts and identified potential issues with token refresh logic.",
    },
    {
      id: 7,
      timestamp: "2023-06-15T09:15:00",
      action: "Generated unit tests for authentication module",
      type: "testing",
      details:
        "Generated comprehensive unit tests for the authentication module, covering login, logout, and token refresh scenarios.",
    },
    {
      id: 8,
      timestamp: "2023-06-15T09:00:00",
      action: "Started model execution with mistralai/Mistral-7B-v0.1",
      type: "system",
      details:
        "Initialized the LLM with model mistralai/Mistral-7B-v0.1 and connected to the repository user/project-name.",
    },
  ]

  const filteredActivities = activities.filter(
    (activity) =>
      activity.action.toLowerCase().includes(filter.toLowerCase()) ||
      activity.type.toLowerCase().includes(filter.toLowerCase()) ||
      activity.details.toLowerCase().includes(filter.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " " +
      date.toLocaleDateString([], { month: "short", day: "numeric" })
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Activity Log</h2>
        <Button variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Export Log
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Filter activities..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Tabs defaultValue="all" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pr">Pull Requests</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Activity Timeline</CardTitle>
          <CardDescription>Chronological log of all actions performed by the model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="relative pb-8">
                {activity.id !== filteredActivities.length && (
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-muted" aria-hidden="true"></span>
                )}
                <div className="relative flex items-start space-x-3">
                  <div
                    className={`relative px-1.5 py-1.5 rounded-full ${
                      activity.type === "pull-request"
                        ? "bg-blue-100"
                        : activity.type === "documentation"
                          ? "bg-purple-100"
                          : activity.type === "issue"
                            ? "bg-yellow-100"
                            : activity.type === "branch"
                              ? "bg-green-100"
                              : activity.type === "code-review"
                                ? "bg-orange-100"
                                : activity.type === "testing"
                                  ? "bg-pink-100"
                                  : "bg-gray-100"
                    }`}
                  >
                    {activity.type === "pull-request" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-700"
                      >
                        <circle cx="18" cy="18" r="3" />
                        <circle cx="6" cy="6" r="3" />
                        <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                        <path d="M11 18H8a2 2 0 0 1-2-2V9" />
                      </svg>
                    )}
                    {activity.type === "documentation" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-700"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                    {activity.type === "issue" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-yellow-700"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    )}
                    {activity.type === "branch" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-700"
                      >
                        <line x1="6" y1="3" x2="6" y2="15" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <path d="M18 9a9 9 0 0 1-9 9" />
                      </svg>
                    )}
                    {activity.type === "code-review" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-orange-700"
                      >
                        <path d="m16 18 2-2-2-2" />
                        <path d="m8 18-2-2 2-2" />
                        <path d="m12 12 2 2-2 2" />
                      </svg>
                    )}
                    {activity.type === "testing" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-pink-700"
                      >
                        <path d="M2 12h20" />
                        <path d="M2 12a10 10 0 0 1 20 0" />
                        <path d="M2 12a10 10 0 0 0 20 0" />
                        <path d="M12 2v20" />
                      </svg>
                    )}
                    {activity.type === "system" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-700"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="15" y1="3" x2="15" y2="21" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm font-medium text-foreground">{activity.action}</div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(activity.timestamp)}</p>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>{activity.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

