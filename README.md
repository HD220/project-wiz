# Project Wiz

**Your Autonomous Software Factory**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/HD220/project-wiz)](https://github.com/HD220/project-wiz/issues)
[![GitHub forks](https://img.shields.io/github/forks/HD220/project-wiz)](https://github.com/HD220/project-wiz/network)
[![GitHub stars](https://img.shields.io/github/stars/HD220/project-wiz)](https://github.com/HD220/project-wiz/stargazers)

Project Wiz is an innovative desktop application designed to function as an autonomous software factory. Built with ElectronJS and featuring a Discord-inspired interface, it leverages AI Agents (Personas) to automate and streamline various stages of the software development lifecycle.

## Vision

Our vision is to **transform fundamentally the software development lifecycle through intelligent collaboration between humans and autonomous AI agents.** We aim to create a platform where AI agents are integral, proactive members of development teams, capable of handling complex tasks from end to end, empowering human developers to focus on innovation and high-level problem-solving.

For more details, see our [Vision and Goals](./docs/project-overview/vision-and-goals.md).

## Key Features

* **AI-Powered Automation:** Utilizes AI Agents (Personas) to automate development tasks.
* **Discord-Inspired UI:** Offers an intuitive and familiar user experience.
* **Project Management:** Centralized environment for managing software projects.
* **Customizable AI Agents (Personas):** Create and configure specialized AI agents for different roles and tasks.
* **Job-Based Task Execution:** Define, assign, and track tasks (Jobs) for Personas.
* **LLM Integration:** Supports integration with various Large Language Models.
* **Extensible Tooling System:** Agents use tools to interact with files, code, and external systems.
* **Workflow Automation:** Define and automate complex development workflows.

## Core Concepts

* **Personas:** AI agents you define with specific roles, goals, and capabilities. They are like virtual team members that execute tasks. Learn more in the [Personas Guide](./docs/user-guide/05-personas-agents.md).
* **Jobs:** Specific tasks assigned to Personas, ranging from code generation and analysis to documentation and testing. Jobs are the fundamental units of work in Project Wiz. Learn more in the [Jobs Guide](./docs/user-guide/06-jobs-automation.md).
* **Tools:** Capabilities or functions that Personas can use to perform their jobs, such as file system operations, terminal commands, or code analysis.

## Who is this for?

Project Wiz is ideal for:

* **Developers & Development Teams:** Seeking to automate repetitive tasks and accelerate development.
* **Project Managers:** Needing tools for orchestrating complex tasks and tracking progress.
* **Software Companies:** Aiming to boost team productivity and optimize development workflows.
* **AI & Automation Enthusiasts:** Interested in exploring AI's potential in software development.

## Tech Stack

* **Framework:** ElectronJS
* **Frontend:** React, TypeScript, Tailwind CSS
* **Backend/Core:** TypeScript, Node.js
* **AI:** Integration with Large Language Models (e.g., OpenAI, DeepSeek)
* **Database:** SQLite (via Drizzle ORM)
* **Bundler:** Vite

## Getting Started

To get Project Wiz up and running:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/HD220/project-wiz.git
    cd project-wiz
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Run the application:**

    ```bash
    npm start
    ```

For more detailed setup instructions, please refer to the [Development Setup Guide](./docs/technical-documentation/06-development-setup.md) and the [Quick Start Guide](./docs/user-guide/02-quick-start.md).

## Documentation

Dive deeper into Project Wiz with our comprehensive documentation:

* **[User Guide](./docs/user-guide/01-introduction.md):** Introduces users to Project Wiz and how to use its features.
* **[Technical Documentation](./docs/technical-documentation/01-architecture.md):** Details the architecture, agent framework, and other technical aspects for developers.
* **[Vision and Goals](./docs/project-overview/vision-and-goals.md):** Outlines the long-term vision and strategic objectives of Project Wiz.
* **[Roadmap](./docs/project-overview/roadmap.md):** Shows the planned features and future development direction.

## Contributing

We welcome contributions! Whether it's reporting a bug, suggesting a feature, improving documentation, or writing code, your help is appreciated.

Please read our [Contribution Guide](./docs/contribution-guide.md) to get started and review our [Code of Conduct](./docs/code-of-conduct.md).

## Roadmap

Check out our [Project Roadmap](./docs/project-overview/roadmap.md) to see what features and improvements are planned for the future.

## License

Project Wiz is released under the MIT License.
