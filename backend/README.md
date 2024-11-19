<p align="center">
    <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" align="center" width="30%">
</p>
<p align="center"><h1 align="center">PROJECT-WIZ</h1></p>
<p align="center">
	<em>Empower Your Projects with Project-Wiz: Unleash Seamless Infrastructure Orchestration and Developer Workflow Optimization!</em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/HD220/project-wiz?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/HD220/project-wiz?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/HD220/project-wiz?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/HD220/project-wiz?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="center"><!-- default option, no dependency badges. -->
</p>
<p align="center">
	<!-- default option, no dependency badges. -->
</p>
<br>

##  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Project Structure](#-project-structure)
  - [ Project Index](#-project-index)
- [ Getting Started](#-getting-started)
  - [ Prerequisites](#-prerequisites)
  - [ Installation](#-installation)
  - [ Usage](#-usage)
  - [ Testing](#-testing)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

---

##  Overview

Project-wiz is a comprehensive open-source tool that streamlines project infrastructure management and developer workflows. It orchestrates Docker services like Redis, Grafana, and Minio, ensuring seamless communication and resource allocation. With features like commit linting, automation of development tasks, and efficient data processing, it optimizes processes for developers working on complex projects. Targeted at tech teams and developers seeking enhanced productivity and collaboration.

---

##  Features

|      | Feature         | Summary       |
| :--- | :---:           | :---          |
| ⚙️  | **Architecture**  | <ul><li>Modular architecture with microservices</li><li>Containerized deployment using Docker</li><li>Integration with various services like Redis, ChromaDB, Loki, Grafana, and Minio</li></ul> |
| 🔩 | **Code Quality**  | <ul><li>Consistent coding standards enforced through ESLint</li><li>Strong typing with TypeScript</li><li>Pre-commit hooks for code quality checks</li></ul> |
| 📄 | **Documentation** | <ul><li>Extensive documentation in TypeScript and various configuration files</li><li>Usage of Markdown, JSON, YAML, and shell scripts for documentation</li><li>Package managers and container usage instructions provided</li></ul> |
| 🔌 | **Integrations**  | <ul><li>Integration with Docker for containerization</li><li>Integration with Minio, Redis, ChromaDB, Loki, and Grafana for project infrastructure</li><li>Configuration files for seamless integration</li></ul> |
| 🧩 | **Modularity**    | <ul><li>Component-based architecture with clear separation of concerns</li><li>Reusable components across services</li><li>Easy scalability and maintenance</li></ul> |
| 🧪 | **Testing**       | <ul><li>Comprehensive testing setup with npm test commands</li><li>Testing for backend and frontend components</li><li>Ensuring code reliability and functionality</li></ul> |
| ⚡️  | **Performance**   | <ul><li>Optimized performance through efficient code practices</li><li>Monitoring and visualization with Grafana and Loki</li><li>Scalable infrastructure for high performance</li></ul> |
| 🛡️ | **Security**      | <ul><li>Secure deployment using Docker containers</li><li>Secure data storage with Minio and Redis</li><li>Secure communication with ChromaDB</li></ul> |
| 📦 | **Dependencies**  | <ul><li>Dependencies managed using npm and Docker</li><li>Package.json and Dockerfile for dependency management</li><li>Clear dependency list for project setup</li></ul> |

---

##  Project Structure

```sh
└── project-wiz/
    ├── ISSUES.md
    ├── LICENSE
    ├── README.md
    ├── backend
    │   ├── .dockerignore
    │   ├── .eslintrc.json
    │   ├── .gitignore
    │   ├── .husky
    │   ├── CHANGELOG.md
    │   ├── Dockerfile
    │   ├── commitlint.config.mjs
    │   ├── eslint.config.mjs
    │   ├── index.ts.jsonl
    │   ├── output.jsonl
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── src
    │   ├── teste.json
    │   └── tsconfig.json
    ├── chromadb
    │   └── .gitignore
    ├── docker-compose.yml
    ├── frontend
    │   ├── .dockerignore
    │   ├── .eslintrc.json
    │   ├── .gitignore
    │   ├── Dockerfile
    │   ├── README.md
    │   ├── components.json
    │   ├── next.config.mjs
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── postcss.config.mjs
    │   ├── src
    │   ├── tailwind.config.ts
    │   └── tsconfig.json
    ├── loki
    │   ├── loki-config.yaml
    │   └── runtime_config.yaml
    └── minio
        └── entrypoint.sh
```


###  Project Index
<details open>
	<summary><b><code>PROJECT-WIZ/</code></b></summary>
	<details> <!-- __root__ Submodule -->
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/docker-compose.yml'>docker-compose.yml</a></b></td>
				<td>- Orchestrates Docker services for project infrastructure, including Redis, ChromaDB, Loki, Grafana, and Minio<br>- Manages networking, ports, volumes, and environment variables for each service, ensuring seamless communication and resource allocation within the project ecosystem.</td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- minio Submodule -->
		<summary><b>minio</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/minio/entrypoint.sh'>entrypoint.sh</a></b></td>
				<td>- Initiates MinIO server, waits for it to start, sets up necessary buckets, and confirms successful initialization<br>- This script ensures MinIO is ready for use by creating essential resources.</td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- backend Submodule -->
		<summary><b>backend</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/commitlint.config.mjs'>commitlint.config.mjs</a></b></td>
				<td>Enhances commit message consistency by extending conventional commit linting rules.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/package.json'>package.json</a></b></td>
				<td>- Automates software development tasks, such as coding, issue creation, and pull request generation, to enhance developer workflow<br>- Acts as a standalone service integrating with GitHub, Chromadb, and GPT<br>- Designed to optimize developers' processes by functioning as a programming bot.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/output.jsonl'>output.jsonl</a></b></td>
				<td>Defines a `ResponseData` type with nested objects for `installations` and `repositories`, each containing key-value pairs with specific data types.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/index.ts.jsonl'>index.ts.jsonl</a></b></td>
				<td>- Defines the main function orchestrating data processing and task execution within the project<br>- It initializes necessary resources, retrieves data, processes repositories, and triggers various worker functions<br>- Additionally, it manages job scheduling and queue operations for efficient task handling.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/eslint.config.mjs'>eslint.config.mjs</a></b></td>
				<td>- Define ESLint configuration for JavaScript, TypeScript, and React with recommended settings, global variables, and custom rules<br>- Integrate plugins for syntax checking and enforce coding standards across various file types in the project.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/package-lock.json'>package-lock.json</a></b></td>
				<td>- The code file in backend/package-lock.json serves as a lockfile for the "project-wiz" project, ensuring consistent dependency versions for seamless collaboration and deployment<br>- This file captures the specific versions of various dependencies like "@babel/parser", "@dagrejs/graphlib", "acorn", "bullmq", "chromadb", and others, crucial for maintaining stability and reproducibility across the codebase architecture.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/tsconfig.json'>tsconfig.json</a></b></td>
				<td>- Enables strict type-checking and module resolution for the project, ensuring consistent casing in imports and allowing synthetic default imports<br>- The file configures TypeScript compiler options for generating output files in a specified directory, while skipping type checking of declaration files<br>- This setup enhances code quality and compatibility within the codebase architecture.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/Dockerfile'>Dockerfile</a></b></td>
				<td>Facilitates Docker container setup for Node.js backend, installing dependencies, copying project files, exposing port 3000, and starting the application.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/.eslintrc.json'>.eslintrc.json</a></b></td>
				<td>Configures ESLint rules for TypeScript in the backend to allow any type, extending core web vitals.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/teste.json'>teste.json</a></b></td>
				<td>Identifies main modules and their file paths within the project architecture.</td>
			</tr>
			</table>
			<details>
				<summary><b>.husky</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/.husky/install.mjs'>install.mjs</a></b></td>
						<td>- Prevent Husky installation in production and CI environments by checking the NODE_ENV and CI variables<br>- Import and log Husky configuration if not in production or CI.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/.husky/pre-commit'>pre-commit</a></b></td>
						<td>- Automates code quality checks and testing before commits<br>- Integrates linting, lint-staged, and testing scripts to ensure high code quality and prevent issues in the codebase<br>- This file plays a crucial role in maintaining the overall project quality and stability by enforcing best practices and catching errors early in the development process.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/.husky/commit-msg'>commit-msg</a></b></td>
						<td>Enforce commit message conventions using commitlint before making a commit.</td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>src</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/index.ts'>index.ts</a></b></td>
						<td>- Initiates various workers to analyze and process repository data, including installation, branch changes, and file analysis<br>- Connects to Redis to retrieve repository information and performs TypeScript analysis on selected files<br>- Generates a dependency graph based on file imports and content, facilitating further data processing and visualization within the codebase architecture.</td>
					</tr>
					</table>
					<details>
						<summary><b>workers</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/workers/installation.ts'>installation.ts</a></b></td>
								<td>- Handles installation and cloning of GitHub repositories, utilizing queues and workers for asynchronous processing<br>- Manages different steps of the installation process and error handling<br>- Integrates with various services for repository analysis.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/workers/chatCompletion.ts'>chatCompletion.ts</a></b></td>
								<td>- Implements a chat completion worker that processes messages, validates prompts, and generates responses using OpenAI<br>- Manages progress through stages like validating, in progress, and completed, with retry logic for failed attempts<br>- Utilizes a queue and worker setup for efficient processing within the project architecture.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/workers/analyseRepository.ts'>analyseRepository.ts</a></b></td>
								<td>- The `analyseRepository.ts` file orchestrates the analysis of a repository by handling different processing steps for each commit<br>- It coordinates the analysis of TypeScript files, generates descriptions using AI, and manages job queues efficiently<br>- This file plays a crucial role in automating the analysis workflow for repositories.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/workers/branchChange.ts'>branchChange.ts</a></b></td>
								<td>- Implements a worker that handles branch change events by pulling the latest changes from a Git repository, analyzing them, and queuing further processing tasks<br>- This worker integrates with Redis for version tracking and uses BullMQ for job queuing<br>- The code ensures seamless handling of branch updates within the project architecture.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/workers/analyseFile.ts'>analyseFile.ts</a></b></td>
								<td>- The `analyseFile.ts` code orchestrates the analysis of file data, managing validation and processing steps<br>- It interacts with external services to store and retrieve information, ensuring data integrity and completeness throughout the workflow.</td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>services</b></summary>
						<blockquote>
							<details>
								<summary><b>openai</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/openai/createOpenAI.ts'>createOpenAI.ts</a></b></td>
										<td>Initialize OpenAI client with API key for seamless integration within the project's services.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/openai/OpenAIClient.ts'>OpenAIClient.ts</a></b></td>
										<td>- Facilitates interaction with OpenAI's API for chat completions, file management, and batch processing<br>- Handles preparing prompts, creating batches, streaming completions, and managing files<br>- Ensures efficient retrieval and processing of batch outputs<br>- Enables seamless integration with OpenAI services for various AI-driven tasks within the project architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/openai/types.ts'>types.ts</a></b></td>
										<td>Defines response and chat completion data structures for OpenAI service integration in the backend services, facilitating communication with the OpenAI API.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/openai/index.ts'>index.ts</a></b></td>
										<td>Facilitates access to OpenAI services by exporting functions and types for seamless integration within the project architecture.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>github</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/github/index.ts'>index.ts</a></b></td>
										<td>Exports functions for generating JWT tokens and getting OctoKit instances, essential for GitHub service integration within the project architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/github/getOctoKit.ts'>getOctoKit.ts</a></b></td>
										<td>Enables retrieval of OctoKit instance with JWT token authentication for GitHub services in the backend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/github/generateJWT.ts'>generateJWT.ts</a></b></td>
										<td>- Generates a JSON Web Token (JWT) for GitHub authentication using the provided payload and private key<br>- The JWT is signed using the RS256 algorithm and includes the necessary timestamp and issuer information.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>anyliser</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/anyliser/moduleAnalyser.ts'>moduleAnalyser.ts</a></b></td>
										<td>- Analyzes module dependencies, calculates edge weights, detects communities, and refines groups based on cohesion and coupling metrics<br>- The code constructs a dependency graph, evaluates relationships between files, and optimizes module groupings for improved architecture clarity and maintainability.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/anyliser/dependencyGraphBuilder.ts'>dependencyGraphBuilder.ts</a></b></td>
										<td>- Generates a dependency graph representing file relationships and modules within the codebase, facilitating visualization and analysis<br>- The code constructs nodes for code blocks and edges for dependencies, enabling identification of components and modules<br>- This aids in understanding code structure and relationships for effective maintenance and development.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/anyliser/types.ts'>types.ts</a></b></td>
										<td>Define data structures for block and file analysis in the backend services to facilitate processing and analysis of code blocks and files within the project architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/anyliser/GraphBuilder.ts'>GraphBuilder.ts</a></b></td>
										<td>- Generates a graph structure from file dependencies, calculating cohesion and coupling metrics for module groups<br>- Utilizes Dijkstra's algorithm to analyze the graph and determine shortest paths between nodes.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/anyliser/typescryptAnalyser.ts'>typescryptAnalyser.ts</a></b></td>
										<td>- Generates a detailed analysis of TypeScript files, extracting imports, exports, and main code blocks<br>- Identifies external dependencies and computes block hashes for each section<br>- The code provides a comprehensive overview of the file structure and dependencies within the TypeScript codebase.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>simple-git</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/simple-git/index.ts'>index.ts</a></b></td>
										<td>- Enables creation, cloning, and pulling of Git repositories, providing file diff and commit history functionalities<br>- Supports managing repositories in a specified base path, facilitating version control operations within the project architecture.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>chroma</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/chroma/createChroma.ts'>createChroma.ts</a></b></td>
										<td>- Creates a Chroma client instance with authentication credentials and performs a heartbeat check<br>- This service function initializes a connection to ChromaDB, enabling interaction with the database for the backend services.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/chroma/index.ts'>index.ts</a></b></td>
										<td>Facilitates Chroma service creation and export within the backend architecture.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>redis</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/redis/index.ts'>index.ts</a></b></td>
										<td>Expose Redis connection functionality for the backend services by importing and exporting the 'connectRedis' function.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/redis/connectRedis.ts'>connectRedis.ts</a></b></td>
										<td>- Handles Redis connection, maintains connection health with periodic pings, and provides functions to retrieve the latest version and items based on a key pattern from Redis<br>- This service ensures seamless communication with Redis for version tracking and data retrieval within the project architecture.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>bullmq</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/bullmq/createQueue.ts'>createQueue.ts</a></b></td>
										<td>- Creates a BullMQ queue with specified settings and error handling<br>- The code initializes a queue with connection details and default job options, ensuring jobs are removed upon completion or failure<br>- It logs errors and returns the configured queue for processing tasks efficiently within the project's architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/bullmq/config.ts'>config.ts</a></b></td>
										<td>Define the Redis connection configuration for the BullMQ job queue service in the backend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/bullmq/index.ts'>index.ts</a></b></td>
										<td>Facilitates the creation of queues and workers for job processing within the project architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/services/bullmq/createWorker.ts'>createWorker.ts</a></b></td>
										<td>- Creates a worker for processing tasks using BullMQ, a job queue library<br>- The worker is configured with specific connection settings and error handling<br>- This function encapsulates the setup and initialization of a worker, contributing to the efficient execution of background tasks within the project architecture.</td>
									</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<details>
						<summary><b>utils</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/utils/generateRepositorySourceMap.ts'>generateRepositorySourceMap.ts</a></b></td>
								<td>- Generates a source map for a given code file, mapping imports and their corresponding paths<br>- This function parses the code, extracts import declarations, and organizes them into a structured map<br>- The resulting source map provides a clear overview of the code's dependencies and their relationships.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/utils/generateModuleName.ts'>generateModuleName.ts</a></b></td>
								<td>- Generates module names based on identifiers by tokenizing, grouping, and selecting relevant tokens<br>- Filters out common words and capitalizes the first letter of tokens<br>- The resulting name is a concatenation of the top 3 selected tokens followed by "Module" or "UnknownModule" if no tokens are selected.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/backend/src/utils/buildAnalyseTree.ts'>buildAnalyseTree.ts</a></b></td>
								<td>- Generates a hierarchical tree structure for file analysis based on the provided file paths<br>- The function organizes files into nodes and leaves, creating a structured representation for further processing within the project architecture.</td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- frontend Submodule -->
		<summary><b>frontend</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/next.config.mjs'>next.config.mjs</a></b></td>
				<td>Configures Next.js to allow loading images from a specific remote server.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/components.json'>components.json</a></b></td>
				<td>- Defines component aliases and styling configurations for the frontend, enhancing code readability and maintainability<br>- The file establishes aliases for components, utilities, and hooks, along with Tailwind CSS settings<br>- It ensures a structured approach to organizing and styling frontend components within the project architecture.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/package.json'>package.json</a></b></td>
				<td>- Manages frontend build scripts and dependencies for the project, enabling development, building, and starting the application<br>- It configures essential scripts like dev, build, start, and lint, along with various dependencies for frontend development and UI components.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/postcss.config.mjs'>postcss.config.mjs</a></b></td>
				<td>Defines PostCSS configuration for TailwindCSS plugin in the frontend architecture, facilitating consistent styling across the project.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/package-lock.json'>package-lock.json</a></b></td>
				<td>- SUMMARY:
The code file in frontend/package-lock.json manages the dependencies for the frontend module of the project<br>- It ensures that the necessary external libraries, such as @hookform/resolvers and @radix-ui components, are included and maintained at specific versions<br>- This file plays a crucial role in orchestrating the frontend architecture by handling the required packages and their versions, ensuring a stable and functional frontend application.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/tsconfig.json'>tsconfig.json</a></b></td>
				<td>- Configure TypeScript settings for the frontend to enable advanced features like JSX support, module resolution, and path aliases<br>- This file ensures strict type checking and compatibility with the project's bundler, Next.js<br>- It defines compiler options, includes necessary files, and excludes external dependencies.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/Dockerfile'>Dockerfile</a></b></td>
				<td>- Facilitates building and running the frontend application in a Docker container<br>- Sets up the Node environment, installs dependencies, exposes the application port, and defines the command to start the application<br>- This Dockerfile streamlines the deployment process for the frontend component of the project.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/.eslintrc.json'>.eslintrc.json</a></b></td>
				<td>Configures ESLint rules for Next.js project with TypeScript, focusing on core web vitals.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/tailwind.config.ts'>tailwind.config.ts</a></b></td>
				<td>- Define Tailwind CSS configuration for colors, animations, and plugins to customize the frontend styling<br>- Tailwind.config.ts file specifies color themes, border radius, keyframes for animations, and plugins like tailwindcss-animate<br>- This configuration enhances the visual appeal and user experience of the project's frontend components.</td>
			</tr>
			</table>
			<details>
				<summary><b>src</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/middleware.ts'>middleware.ts</a></b></td>
						<td>Exports authentication middleware for the frontend from the auth library.</td>
					</tr>
					</table>
					<details>
						<summary><b>actions</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/actions/cypher.actions.ts'>cypher.actions.ts</a></b></td>
								<td>- Implement encryption, decryption, and GitHub signature validation functions using AES-256-CBC for secure data handling<br>- The code ensures data confidentiality and integrity, crucial for protecting sensitive information and verifying GitHub webhook payloads.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/actions/user.actions.ts'>user.actions.ts</a></b></td>
								<td>- The code in frontend/src/actions/user.actions.ts handles saving and retrieving user configuration data securely using encryption and Redis<br>- It ensures data integrity and confidentiality by encrypting sensitive information before storage and decrypting it upon retrieval<br>- This functionality enhances the overall security and reliability of the project's user configuration management.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/actions/schemas.ts'>schemas.ts</a></b></td>
								<td>Defines installation schema for repository data validation in the frontend actions, ensuring data integrity and consistency across the codebase architecture.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/actions/repository.actions.ts'>repository.actions.ts</a></b></td>
								<td>- Implement functions to save and retrieve repository configurations securely using Redis<br>- Encrypt and decrypt sensitive data before storing and after retrieving from the database<br>- This ensures data integrity and confidentiality for user-specific repository settings.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/actions/github.actions.ts'>github.actions.ts</a></b></td>
								<td>- The code file in frontend/src/actions/github.actions.ts facilitates interactions with the GitHub API, enabling functions to generate JWT tokens, retrieve user organizations, fetch user repositories, list app installations, and access repository details<br>- It plays a crucial role in managing authentication, data retrieval, and organization within the project's architecture.</td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>app</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/layout.tsx'>layout.tsx</a></b></td>
								<td>- Defines the root layout for the Project Wiz app, setting up the overall structure and styling<br>- It includes the necessary providers for themes and authentication, along with the header and main content sections<br>- The layout ensures a consistent look and feel across the application while handling user authentication seamlessly.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/globals.css'>globals.css</a></b></td>
								<td>Define global styling variables and apply Tailwind CSS utilities for consistent theming across the frontend, ensuring a unified visual experience.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/fonts.ts'>fonts.ts</a></b></td>
								<td>Define font variables for Geist Sans, Geist Mono, Inter, and Roboto Mono using local and Google fonts for the project's typography system.</td>
							</tr>
							</table>
							<details>
								<summary><b>api</b></summary>
								<blockquote>
									<details>
										<summary><b>webhook</b></summary>
										<blockquote>
											<details>
												<summary><b>github</b></summary>
												<blockquote>
													<table>
													<tr>
														<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/api/webhook/github/route.ts'>route.ts</a></b></td>
														<td>- Handle incoming GitHub webhook events, validate signatures, and update Redis with repository data based on event type and action<br>- Logs event details and ensures data integrity for user installations and repositories.</td>
													</tr>
													</table>
												</blockquote>
											</details>
										</blockquote>
									</details>
									<details>
										<summary><b>github</b></summary>
										<blockquote>
											<details>
												<summary><b>setup</b></summary>
												<blockquote>
													<table>
													<tr>
														<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/api/github/setup/route.ts'>route.ts</a></b></td>
														<td>Implements a route setup for redirecting incoming requests to the root URL using Next.js server-side rendering.</td>
													</tr>
													</table>
												</blockquote>
											</details>
										</blockquote>
									</details>
									<details>
										<summary><b>auth</b></summary>
										<blockquote>
											<details>
												<summary><b>[...nextauth]</b></summary>
												<blockquote>
													<table>
													<tr>
														<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/api/auth/[...nextauth]/route.ts'>route.ts</a></b></td>
														<td>Expose authentication handlers for GET and POST requests by importing from the auth module, enhancing the project's security layer.</td>
													</tr>
													</table>
												</blockquote>
											</details>
										</blockquote>
									</details>
								</blockquote>
							</details>
							<details>
								<summary><b>user</b></summary>
								<blockquote>
									<details>
										<summary><b>config</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/user/config/page.tsx'>page.tsx</a></b></td>
												<td>Retrieve user configuration and installed repositories, then display a form with default values for API token, batch API setting, budget, and allocations.</td>
											</tr>
											</table>
										</blockquote>
									</details>
								</blockquote>
							</details>
							<details>
								<summary><b>(root)</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/(root)/dashboard-filters.tsx'>dashboard-filters.tsx</a></b></td>
										<td>- Implements a dashboard filter component that allows users to filter repositories by owner<br>- It leverages dropdown menus and search input for a seamless filtering experience<br>- The component dynamically updates the URL based on user selections, enhancing user interaction and navigation within the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/(root)/dashboard.tsx'>dashboard.tsx</a></b></td>
										<td>- Define the dashboard layout and populate it with budget usage data, organization filters, and a list of repositories based on user input<br>- The code orchestrates the display of key components within the dashboard, leveraging user authentication and GitHub API actions to fetch relevant data dynamically.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/(root)/page.tsx'>page.tsx</a></b></td>
										<td>- Defines the Home component responsible for rendering the main page content based on user authentication status<br>- It leverages the auth module for user session handling and conditionally displays the Dashboard or a login prompt<br>- The component encapsulates the logic for handling search parameters and user authentication state within the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/(root)/repo-list.tsx'>repo-list.tsx</a></b></td>
										<td>- Generates a list of repositories based on user input and displays them<br>- If no repositories are found, prompts the user to install the application<br>- For each repository, shows its name, owner, and a button to view details<br>- Additionally, includes a visual representation of budget usage for each repository.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>repository</b></summary>
								<blockquote>
									<details>
										<summary><b>[...repository]</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/repository/[...repository]/tab-button.tsx'>tab-button.tsx</a></b></td>
												<td>- Enables tab navigation functionality within the project by handling tab switching and URL updates based on user interactions<br>- Uses client-side routing to update the URL with the selected tab value, ensuring a seamless user experience.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/app/repository/[...repository]/page.tsx'>page.tsx</a></b></td>
												<td>- Render a dynamic page displaying repository information with tabs for different views<br>- Fetch repository data and configuration, then present it in a structured layout<br>- The page allows users to navigate between Dashboard, Bots, Context, Dependency Graph, and Configuration sections seamlessly.</td>
											</tr>
											</table>
										</blockquote>
									</details>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<details>
						<summary><b>lib</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/lib/utils.ts'>utils.ts</a></b></td>
								<td>Enhances class management by merging Tailwind and custom classes for streamlined styling across the project.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/lib/auth.ts'>auth.ts</a></b></td>
								<td>- Enables authentication using GitHub OAuth for the project, handling user sessions and token refresh<br>- Integrates with NextAuth to manage user authentication and session data securely<br>- This code file defines user and session interfaces, sets up GitHub provider configuration, and implements token refresh logic for seamless user authentication.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/lib/redis.ts'>redis.ts</a></b></td>
								<td>- Establishes a connection to a Redis server, maintaining it with periodic pings<br>- Logs connection status and errors.</td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>components</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/search-input.tsx'>search-input.tsx</a></b></td>
								<td>- Implements a search input component that integrates with search parameters, allowing users to search for repositories<br>- The component utilizes an input field for users to enter search terms and updates the search parameter accordingly.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/header.tsx'>header.tsx</a></b></td>
								<td>- Implements the header component for the ProjectWiz application, providing navigation links, user authentication controls, and a dropdown menu for account management<br>- The component integrates with Next.js authentication features to handle user sign-in and sign-out actions seamlessly.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/signout-button.tsx'>signout-button.tsx</a></b></td>
								<td>- Enables user sign-out functionality using NextAuth in the frontend<br>- The SignOutButton component triggers the signOut action upon clicking, facilitating a seamless logout experience for users<br>- This component enhances the user interface by providing a straightforward way to log out of the application.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/mode-toggle.tsx'>mode-toggle.tsx</a></b></td>
								<td>- Implements a mode toggle feature using dropdown menu for theme selection<br>- Utilizes Next.js theme hook to switch between light, dark, and system themes<br>- Enhances user experience by providing a visually appealing and accessible way to toggle themes seamlessly within the application.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/signin-button.tsx'>signin-button.tsx</a></b></td>
								<td>- Implements a sign-in button component that allows users to sign in using their GitHub account<br>- The component utilizes the next-auth library for authentication and lucide-react icons for visual representation<br>- The button triggers the sign-in process when clicked, providing a seamless user experience for authentication within the frontend of the project.</td>
							</tr>
							</table>
							<details>
								<summary><b>cards</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/cards/card-budget-usage.tsx'>card-budget-usage.tsx</a></b></td>
										<td>- Displays budget usage information in a visually appealing card format<br>- The card showcases total, dedicated, shared, and used budget amounts with corresponding labels<br>- This component enhances the user experience by providing a clear overview of budget allocation and utilization within the application.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>forms</b></summary>
								<blockquote>
									<details>
										<summary><b>repository-config</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/forms/repository-config/index.tsx'>index.tsx</a></b></td>
												<td>- Implement a form for configuring repository settings, including fields for an OpenAI API token and a switch for batch API usage<br>- The form handles submission, saving the configuration, and displaying success/error messages<br>- This component integrates with the project's UI components and actions to provide a seamless user experience.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/forms/repository-config/schema.ts'>schema.ts</a></b></td>
												<td>- Define a schema for repository configuration data, ensuring required fields and data types are validated<br>- This code file establishes a structured format for repository configuration information, enforcing constraints such as numeric ID, string name, owner, and API token, along with a boolean flag for batch API usage.</td>
											</tr>
											</table>
										</blockquote>
									</details>
									<details>
										<summary><b>user-config</b></summary>
										<blockquote>
											<table>
											<tr>
												<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/forms/user-config/index.tsx'>index.tsx</a></b></td>
												<td>- Manages user configuration settings, including API token, budget, and repository allocations<br>- Validates input, calculates budget totals, and allows adding/removing repository allocations<br>- Displays a user-friendly form for adjusting preferences and API settings<br>- Handles form submission, saving user configurations, and displaying success/error messages<br>- Integrates with Next.js session management and custom hooks for a seamless user experience.</td>
											</tr>
											<tr>
												<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/forms/user-config/schema.ts'>schema.ts</a></b></td>
												<td>Define user configuration schema for API settings, budget, and allocations in a structured manner.</td>
											</tr>
											</table>
										</blockquote>
									</details>
								</blockquote>
							</details>
							<details>
								<summary><b>typography</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/typography/h3.tsx'>h3.tsx</a></b></td>
										<td>Defines a reusable H3 component for rendering headings with specified styles and children in the frontend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/typography/h1.tsx'>h1.tsx</a></b></td>
										<td>Defines a reusable H1 component for rendering headings with specified styles and children in the frontend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/typography/h2.tsx'>h2.tsx</a></b></td>
										<td>Defines a reusable H2 component for rendering heading text with specified styles and children in the frontend architecture.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>providers</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/providers/theme-provider.tsx'>theme-provider.tsx</a></b></td>
										<td>Enables theming functionality by wrapping child components with the Next.js ThemeProvider, abstracting theme management for the entire frontend.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/providers/auth-provider.tsx'>auth-provider.tsx</a></b></td>
										<td>Enables authentication functionality by integrating session management with Next.js authentication library.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>ui</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/breadcrumb.tsx'>breadcrumb.tsx</a></b></td>
										<td>- Defines reusable components for breadcrumbs in the UI, including items, links, pages, separators, and ellipses<br>- Facilitates navigation and enhances user experience by structuring breadcrumb elements for easy integration and customization within the frontend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/hover-card.tsx'>hover-card.tsx</a></b></td>
										<td>- Implements a hover card component for interactive UI elements, enhancing user experience by displaying additional information on hover<br>- The component leverages Radix UI library for seamless integration and provides customizable styling options for a polished look and feel.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/badge.tsx'>badge.tsx</a></b></td>
										<td>- Implements a badge component with variant styles for different visual representations<br>- The component leverages class variance authority to manage variant styles efficiently, enhancing reusability and maintainability across the UI components in the project architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/toast.tsx'>toast.tsx</a></b></td>
										<td>- Implements a toast notification system for displaying messages to users<br>- It provides components for creating customizable toast messages with actions, titles, descriptions, and close buttons<br>- The code enhances user experience by offering a visually appealing and interactive way to communicate information within the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/popover.tsx'>popover.tsx</a></b></td>
										<td>- Implements a popover component for UI interactions, utilizing Radix UI for managing popover behavior<br>- The component consists of trigger, anchor, and content elements, each with specific styling and animations<br>- This file enhances the frontend by providing a flexible and visually appealing way to display additional information or actions within the user interface.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/navigation-menu.tsx'>navigation-menu.tsx</a></b></td>
										<td>- Enables creation of a customizable navigation menu component with interactive elements and animations<br>- Facilitates seamless user interaction and visual feedback within the frontend UI, enhancing the overall user experience.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/select.tsx'>select.tsx</a></b></td>
										<td>- Enables interactive UI selection components for the project, utilizing Radix UI primitives<br>- Facilitates user selection with customizable triggers, scroll buttons, labels, items, and separators<br>- Enhances user experience by providing a seamless and visually appealing selection interface.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/switch.tsx'>switch.tsx</a></b></td>
										<td>- Implements a custom switch component for the UI, enhancing user interaction and accessibility<br>- Integrates with Radix UI library for consistent styling and behavior across the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/input.tsx'>input.tsx</a></b></td>
										<td>Defines a reusable React input component with customizable styling and functionality, enhancing user interface consistency and development efficiency.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/pagination.tsx'>pagination.tsx</a></b></td>
										<td>- Define and structure reusable UI components for pagination in the frontend codebase<br>- The components include Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, and PaginationEllipsis<br>- These components facilitate navigation between pages and enhance user experience in the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/dropdown-menu.tsx'>dropdown-menu.tsx</a></b></td>
										<td>- Facilitates creation of customizable dropdown menus with various interactive elements like items, checkboxes, and radio buttons<br>- Enables seamless integration of dropdown functionality into React components, enhancing user experience and interface flexibility within the project's UI architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/progress.tsx'>progress.tsx</a></b></td>
										<td>- Defines a reusable Progress component that leverages Radix UI for managing progress indicators in the frontend architecture<br>- The component encapsulates logic for rendering and updating progress bars based on specified values, contributing to a cohesive user interface experience.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/form.tsx'>form.tsx</a></b></td>
										<td>- Enables form field management and rendering within the React application, providing components for labels, controls, descriptions, and error messages<br>- Facilitates seamless integration with form state management and validation, enhancing user experience and accessibility.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/toggle.tsx'>toggle.tsx</a></b></td>
										<td>- Enables custom styling and behavior for toggle components in the UI by leveraging variant props<br>- The code defines toggle variants based on size and style, allowing for flexible customization<br>- This promotes consistency and enhances user interaction across the project's frontend components.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/sonner.tsx'>sonner.tsx</a></b></td>
										<td>Implements a custom Toaster component that integrates with the theme provider, enhancing the user experience by displaying notifications in a visually consistent manner.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/aspect-ratio.tsx'>aspect-ratio.tsx</a></b></td>
										<td>Exports the AspectRatio component from the @radix-ui/react-aspect-ratio library, enabling consistent aspect ratio handling across UI components.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/card.tsx'>card.tsx</a></b></td>
										<td>- Define reusable UI components for cards with header, title, description, content, and footer<br>- These components handle styling and structure for displaying card-based content in the frontend.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/radio-group.tsx'>radio-group.tsx</a></b></td>
										<td>- Exports RadioGroup and RadioGroupItem components for handling radio group functionality in React, utilizing Radix UI for enhanced accessibility and styling<br>- The components facilitate easy integration of radio buttons with customizable styles and behavior, contributing to a seamless user experience within the frontend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/button.tsx'>button.tsx</a></b></td>
										<td>- Defines button components with various visual styles and sizes, facilitating consistent UI design across the project<br>- The code leverages class variance authority to manage button variants efficiently, ensuring a cohesive user experience<br>- Additionally, it offers flexibility by allowing customization of button appearance and behavior through props.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/skeleton.tsx'>skeleton.tsx</a></b></td>
										<td>- Defines a reusable Skeleton component for displaying loading placeholders in the UI<br>- The component applies a pulse animation and a rounded background style to mimic content loading<br>- It enhances user experience by providing visual feedback during data fetching processes.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/tooltip.tsx'>tooltip.tsx</a></b></td>
										<td>- Implements a tooltip feature using Radix UI components for the frontend architecture<br>- The code defines Tooltip, TooltipTrigger, and TooltipContent components, enhancing user experience with interactive tooltips.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/resizable.tsx'>resizable.tsx</a></b></td>
										<td>Define and export components for resizable panels with drag handles, enhancing UI flexibility and user interaction in the project's frontend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/chart.tsx'>chart.tsx</a></b></td>
										<td>- Enables seamless integration of customizable charts within the project by providing essential components like ChartContainer, ChartTooltip, ChartLegend, and ChartStyle<br>- Facilitates dynamic chart configuration through ChartConfig and ensures consistent theming with THEMES<br>- Enhances user experience by offering interactive and informative chart visualizations.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/carousel.tsx'>carousel.tsx</a></b></td>
										<td>- Facilitates carousel functionality for React components, enabling smooth navigation between slides<br>- Manages carousel state, scroll actions, and button interactions for previous and next slides<br>- Supports customization through various options and plugins<br>- Enhances user experience by providing a seamless carousel interface.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/command.tsx'>command.tsx</a></b></td>
										<td>- The code file in frontend/src/components/ui/command.tsx defines reusable components for handling commands within the project's UI<br>- These components include Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, and CommandSeparator<br>- They facilitate user interactions and enhance the overall user experience of the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/slider.tsx'>slider.tsx</a></b></td>
										<td>- Implements a custom slider component for the UI, enhancing user interaction and visual feedback<br>- Integrates with Radix UI for slider functionality<br>- Maintains a clean and responsive design, supporting various user actions.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/toaster.tsx'>toaster.tsx</a></b></td>
										<td>- The Toaster component renders toast notifications using data from the useToast hook<br>- It leverages the ToastProvider to display toast messages with titles, descriptions, and optional actions<br>- The component enhances user experience by providing visual feedback for important events within the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/drawer.tsx'>drawer.tsx</a></b></td>
										<td>- Defines reusable components for a drawer UI, including triggers, portals, overlays, content, headers, footers, titles, and descriptions<br>- Encapsulates functionality for displaying interactive drawers within the frontend architecture, enhancing user experience and modularity.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/accordion.tsx'>accordion.tsx</a></b></td>
										<td>- Implements UI components for an accordion feature in the frontend, utilizing Radix UI for functionality<br>- The code defines the structure and behavior of the accordion, including items, triggers, and content<br>- This component enhances user interaction by allowing collapsible sections with smooth animations.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/input-otp.tsx'>input-otp.tsx</a></b></td>
										<td>Enables creation of customizable OTP input components for React UI, facilitating seamless integration and management of OTP input fields within the project's frontend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/tabs.tsx'>tabs.tsx</a></b></td>
										<td>- Expose reusable UI components for tabs functionality in the frontend architecture<br>- The code in the provided file defines and exports components for tabs, including the root, list, trigger, and content<br>- These components facilitate the implementation of tabbed interfaces in the project, enhancing user interaction and navigation within the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/toggle-group.tsx'>toggle-group.tsx</a></b></td>
										<td>- Enables creation of toggle groups with customizable variants and sizes, facilitating consistent styling across components<br>- The code establishes a context for toggle group settings and offers components for managing toggle items within the group<br>- This promotes reusability and maintainability in the UI components of the project.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/collapsible.tsx'>collapsible.tsx</a></b></td>
										<td>Expose collapsible UI components for easy integration within the project architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/table.tsx'>table.tsx</a></b></td>
										<td>- Define reusable React components for building tables with customizable styling and structure<br>- Components include Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, and TableCaption<br>- Facilitates easy creation of dynamic and visually appealing tables within the frontend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/context-menu.tsx'>context-menu.tsx</a></b></td>
										<td>- Implement a comprehensive context menu system for React components, facilitating user interactions with various options and actions<br>- The code file defines reusable components like triggers, items, labels, separators, and shortcuts, enhancing the user experience by providing a structured and intuitive menu interface within the project's frontend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/dialog.tsx'>dialog.tsx</a></b></td>
										<td>- Implements reusable dialog components for user interactions within the frontend architecture<br>- The code defines various elements like Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, and DialogDescription to facilitate structured and interactive dialog experiences.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/alert-dialog.tsx'>alert-dialog.tsx</a></b></td>
										<td>- Defines reusable components for an alert dialog interface, facilitating user interactions within the frontend<br>- The code encapsulates various elements like triggers, overlays, content, headers, footers, titles, descriptions, actions, and cancellations, enhancing the user experience and maintaining a consistent design language across the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/textarea.tsx'>textarea.tsx</a></b></td>
										<td>- Creates a reusable Textarea component for the frontend UI, enhancing user experience by providing a customizable text input field<br>- The component encapsulates styling and functionality, promoting consistency and efficiency across the codebase architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/menubar.tsx'>menubar.tsx</a></b></td>
										<td>- Facilitates creation of customizable menubar components for the project's UI, enhancing user navigation and interaction<br>- The code defines various elements like menus, triggers, items, separators, and shortcuts, contributing to a cohesive and user-friendly interface design.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/avatar.tsx'>avatar.tsx</a></b></td>
										<td>- Defines reusable Avatar components for displaying user profile images with fallback options<br>- Encapsulates UI logic for avatar rendering and styling, enhancing codebase modularity and maintainability<br>- Promotes consistent avatar presentation across the frontend components.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/label.tsx'>label.tsx</a></b></td>
										<td>- Defines a React component for labels with customizable variants, enhancing UI consistency and accessibility across the project<br>- The component leverages Radix UI for label styling and Class Variance Authority for variant management, promoting a scalable and maintainable codebase architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/sheet.tsx'>sheet.tsx</a></b></td>
										<td>- Enables rendering of customizable sheets with headers, footers, titles, and descriptions in a React application<br>- Facilitates smooth transitions and animations for sheet opening and closing, offering a user-friendly interface for displaying content within a modal-like overlay.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/separator.tsx'>separator.tsx</a></b></td>
										<td>- Defines a React component for rendering separators, enhancing UI structure and visual hierarchy<br>- Integrates with Radix UI for consistent styling and functionality across the codebase.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/scroll-area.tsx'>scroll-area.tsx</a></b></td>
										<td>- Enables interactive scrolling behavior within the UI components by integrating with Radix UI's scroll area primitives<br>- This facilitates smooth and responsive scrolling interactions for a seamless user experience.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/checkbox.tsx'>checkbox.tsx</a></b></td>
										<td>- Implements a custom Checkbox component using Radix UI for enhanced styling and functionality<br>- The Checkbox component integrates with React to provide a customizable and accessible checkbox input for user interactions within the frontend architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/calendar.tsx'>calendar.tsx</a></b></td>
										<td>- The Calendar component renders a customizable calendar interface for selecting dates<br>- It leverages DayPicker to display a user-friendly calendar with navigation buttons and styling options<br>- This component enhances the frontend UI by providing a visually appealing and functional date selection feature.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/components/ui/alert.tsx'>alert.tsx</a></b></td>
										<td>- Defines reusable alert components with variant styles for different messages in the frontend UI, enhancing user experience and consistency across the application<br>- The components include Alert, AlertTitle, and AlertDescription, each serving a specific role in displaying alerts with customizable styles based on the provided variant.</td>
									</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<details>
						<summary><b>hooks</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/hooks/use-toast.ts'>use-toast.ts</a></b></td>
								<td>- Enables managing toast notifications with a limit and auto-dismissal feature<br>- Integrates actions to add, update, dismiss, or remove toasts<br>- Provides a custom hook for consuming toast functionality in React components<br>- Facilitates centralized state management and event handling for toast notifications.</td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/HD220/project-wiz/blob/master/frontend/src/hooks/use-search-params.ts'>use-search-params.ts</a></b></td>
								<td>- Enables dynamic URL parameter management for Next.js routes by synchronizing search parameters with the application state<br>- This hook facilitates updating and persisting URL query parameters, ensuring seamless navigation and user experience within the application.</td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- loki Submodule -->
		<summary><b>loki</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/loki/runtime_config.yaml'>runtime_config.yaml</a></b></td>
				<td>Enables dynamic runtime configuration overrides for the project, enhancing flexibility and customization without code changes.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/HD220/project-wiz/blob/master/loki/loki-config.yaml'>loki-config.yaml</a></b></td>
				<td>- Define a complete configuration for deploying Loki with a s3-compatible API like MinIO for storage<br>- Configure index files to be written locally and shipped to storage via tsdb-shipper<br>- Set up server settings, common configurations, schema settings, and storage configurations for seamless deployment and operation.</td>
			</tr>
			</table>
		</blockquote>
	</details>
</details>

---
##  Getting Started

###  Prerequisites

Before getting started with project-wiz, ensure your runtime environment meets the following requirements:

- **Programming Language:** TypeScript
- **Package Manager:** Npm
- **Container Runtime:** Docker


###  Installation

Install project-wiz using one of the following methods:

**Build from source:**

1. Clone the project-wiz repository:
```sh
❯ git clone https://github.com/HD220/project-wiz
```

2. Navigate to the project directory:
```sh
❯ cd project-wiz
```

3. Install the project dependencies:


**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm install
```


**Using `docker`** &nbsp; [<img align="center" src="https://img.shields.io/badge/Docker-2CA5E0.svg?style={badge_style}&logo=docker&logoColor=white" />](https://www.docker.com/)

```sh
❯ docker build -t HD220/project-wiz .
```




###  Usage
Run project-wiz using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm start
```


**Using `docker`** &nbsp; [<img align="center" src="https://img.shields.io/badge/Docker-2CA5E0.svg?style={badge_style}&logo=docker&logoColor=white" />](https://www.docker.com/)

```sh
❯ docker run -it {image_name}
```


###  Testing
Run the test suite using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm test
```


---
##  Project Roadmap

- [X] **`Task 1`**: <strike>Implement feature one.</strike>
- [ ] **`Task 2`**: Implement feature two.
- [ ] **`Task 3`**: Implement feature three.

---

##  Contributing

- **💬 [Join the Discussions](https://github.com/HD220/project-wiz/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/HD220/project-wiz/issues)**: Submit bugs found or log feature requests for the `project-wiz` project.
- **💡 [Submit Pull Requests](https://github.com/HD220/project-wiz/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/HD220/project-wiz
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/HD220/project-wiz/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=HD220/project-wiz">
   </a>
</p>
</details>

---

##  License

This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---

##  Acknowledgments

- List any resources, contributors, inspiration, etc. here.

---
