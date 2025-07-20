# Scan Project for Improvements/Features/Refactors

## Objective

Analyze the current repository to identify opportunities for improvements, new features, or necessary refactorings, generating documents in `prps/01-initials/[initial-slug].md` for each identified opportunity.

## Execution Instructions

1. **Deep Structural Analysis:**
- Examine the project architecture
- Identify existing coding patterns
- Analyze dependencies and technologies used
- Review existing documentation: README.md, docs, prps/00-miscellaneous/ai-docs/

2. **Opportunity Identification:**
- Missing or incomplete features
- Code that needs refactoring
- Performance improvements
- Implementation of best practices
- Technical debt fixes

3. **Document Generation:**
- Create [initial-slug].md files in prps/01-initials/
- Name files as [descriptive-name][descriptive-name].md
- Describe the identified opportunity at a high level (unless it is essentially technical and specific)

4. **Creating/Updating Index of initials in `prps/01-initials/README.md` following the template

## Templates

For each opportunity identified, use the following template:

```markdown
# {Name of Feature/Improvement}

## Executive Summary

{Description explaining what will be implemented}

## Context and Motivation

{Why is this implementation necessary? What problem does it solve?}

## Scope

### Included:

- {Specific Item 1}
- {Specific Item 2}
- {Specific Item 3}

### Not Included:

- {Item that falls out of scope}
- {Possible Future Extensions}

## Expected Impact

- **Users:** {How it affects end users}
- **Developers:** {How it affects the development experience}
- **System:** {Impact on performance/architecture}

## Success Criteria

- {Measurable Criterion 1}
- {Measurable Criterion 2}
- {Measurable Criterion 3}
```

For the index, use this template:
```markdown
# Initials Index

## 📋 Opportunities Index

| # | Document | Impact | Priority | Dependencies |
|---|-----------|---------|------------|---------|
```

## Expected Result

Multiple [slug].md files saved in `prps/01-initials/` with prioritized and well-documented opportunities and an updated index.