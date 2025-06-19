# Project Wiz Application Overview

## Vision

The long-term vision of Project Wiz is to **fundamentally transform the software development lifecycle through intelligent collaboration between humans and autonomous AI agents.** We aspire to create a platform where AI agents are integral, proactive members of development teams, capable of handling complex end-to-end tasks.

## Core Purpose

Project Wiz aims to be an **"autonomous software factory,"** functioning as a local desktop application with a user interface visually inspired by Discord. Its core purpose is to provide a platform where a single human user can manage, direct, and collaborate with AI Personas (specialized AI agents). These Personas then automate and enhance the software development process. The system is designed for this direct user-Persona interaction in managing and executing software development tasks, leveraging AI to bring a new level of efficiency and intelligence to the individual developer's workflow.

## Key Objectives

The project strives to achieve several key objectives:

*   **Enable AI Agents for Complex Tasks:** Develop AI Personas capable of performing a wide range of development tasks, including analysis, design, coding, testing, and documentation.
*   **Intelligent Automation:** Move beyond simple scripting to implement intelligent automation across the development lifecycle, adapting to various project needs and technologies.
*   **Empower Human Developers:** Free human developers from repetitive and time-consuming tasks, allowing them to focus on innovation, complex problem-solving, high-level architecture, and strategic decision-making.
*   **Increase Development Speed and Efficiency:** Make the software development process significantly faster, more streamlined, and cost-effective.

## Target Audience

Project Wiz is designed for a diverse audience within the software development ecosystem:

*   **Developers and Development Teams:** Those looking to automate repetitive tasks, accelerate their workflows, and focus on more creative and strategic aspects of development.
*   **Project Managers:** Individuals needing tools to orchestrate complex tasks, manage resources (including AI agents), and efficiently track project progress.
*   **Software Companies:** Organizations aiming to boost the productivity of
their development teams and optimize their overall development lifecycle.
*   **AI Enthusiasts and Researchers:** Those interested in exploring and advancing the application of AI agents in practical software engineering contexts.

## What Users Can Do

Project Wiz offers users a range of functionalities to manage and automate their software development efforts:

*   **Manage Projects:** Centralize and oversee software projects within the application.
*   **Create and Configure Personas:** Define, customize, and manage AI Personas (which configure how an underlying LLM will behave) with specific roles, goals, backstories, LLM settings, and enabled Tools.
*   **Define and Assign Jobs:** Create tasks (Jobs) for Personas to execute, specifying details, assigning them to appropriate Personas, defining dependencies between Jobs, and indirectly influencing their priority through interaction and context.
*   **Interact with Personas:** Communicate with Personas (and potentially witness inter-Persona communication) through a chat-style interface to provide instructions, clarify requirements, receive updates, and collaborate on tasks.
*   **Monitor Progress:** Track the status of Jobs, review outputs, and monitor the performance of AI Personas and the overall system.
*   **Configure LLMs:** Set parameters for the Large Language Models that power the Personas.

## Key Technologies

This section provides a high-level overview of the key technologies and frameworks used in Project Wiz.

*   **Electron:** Serves as the foundational framework for building Project Wiz as a cross-platform desktop application, enabling the use of web technologies for the user interface and application logic.
*   **Vite:** A modern frontend build tool used to provide a fast and efficient development experience for the web-based parts of the application.
*   **React:** A JavaScript library that forms the backbone of the user interface, allowing for the creation of dynamic and interactive components.
*   **TypeScript:** A superset of JavaScript that adds static typing. It is used throughout the project to improve code quality, maintainability, and developer productivity by catching errors early.
*   **Tailwind CSS:** A utility-first CSS framework employed for rapidly building custom user interfaces with a consistent design language.
*   **Drizzle ORM:** A TypeScript-friendly Object-Relational Mapper used to facilitate interactions with the application's database in a type-safe manner.
*   **SQLite (via better-sqlite3):** Acts as the primary lightweight, file-based SQL database engine, storing application data locally.
*   **LinguiJS:** A library integrated for internationalization (i18n) purposes, enabling Project Wiz to support multiple languages.
*   **TanStack Router:** A routing library responsible for managing navigation and views within the React-based frontend of the application.
*   **Zod:** A TypeScript-first schema declaration and validation library used to ensure data integrity and structure, particularly for inputs and configurations.
*   **Vitest:** A fast and modern testing framework utilized for writing and running unit and integration tests to ensure code reliability.
*   **AI SDK (OpenAI, DeepSeek):** Software Development Kits or libraries are used to integrate with and manage communications with various Large Language Models (LLMs) like those from OpenAI and DeepSeek, which power the Personas.
*   **UI Components (inspired by shadcn/ui):** The user interface is constructed using a collection of pre-built, customizable UI components. These components are likely based on foundational libraries like Radix UI and styled with Tailwind CSS, following patterns similar to those popularized by shadcn/ui for a consistent and modern look and feel.
