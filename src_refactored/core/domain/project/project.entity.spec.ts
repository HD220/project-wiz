// src_refactored/core/domain/project/project.entity.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EntityError } from '@/core/common/errors';

import { Project } from './project.entity';
import { ProjectDescription } from './value-objects/project-description.vo';
import { ProjectId } from './value-objects/project-id.vo';
import { ProjectName } from './value-objects/project-name.vo';

describe('Project Entity', () => {
  let defaultProps: {
    id?: ProjectId; // ID is optional for creation
    name: ProjectName;
    description: ProjectDescription;
  };

  beforeEach(() => {
    defaultProps = {
      name: ProjectName.create('Test Project'),
      description: ProjectDescription.create('A simple test project.'),
    };
    // Mock Date to control createdAt and updatedAt
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create a Project entity with generated id, name, description, createdAt, and updatedAt', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const project = Project.create(defaultProps);

    expect(project).toBeInstanceOf(Project);
    expect(project.id()).toBeInstanceOf(ProjectId);
    expect(project.name().value()).toBe('Test Project');
    expect(project.description().value()).toBe('A simple test project.');
    expect(project.createdAt()).toEqual(now);
    expect(project.updatedAt()).toEqual(now);
  });

  it('should create a Project entity with a provided id', () => {
    const specificId = ProjectId.generate();
    const project = Project.create({ ...defaultProps, id: specificId });
    expect(project.id().equals(specificId)).toBe(true);
  });

  it('should throw EntityError if name is not provided', () => {
    const propsWithoutName = { description: defaultProps.description } as any;
    expect(() => Project.create(propsWithoutName)).toThrow(EntityError);
    expect(() => Project.create(propsWithoutName)).toThrow('Project name is required.');
  });

  it('should throw EntityError if description is not provided', () => {
    const propsWithoutDesc = { name: defaultProps.name } as any;
    expect(() => Project.create(propsWithoutDesc)).toThrow(EntityError);
    expect(() => Project.create(propsWithoutDesc)).toThrow('Project description is required.');
  });

  it('should allow changing the project name and update updatedAt', () => {
    const initialTime = new Date(2023, 0, 1, 10, 0, 0);
    vi.setSystemTime(initialTime);
    const project = Project.create(defaultProps);

    const newName = ProjectName.create('New Test Project Name');
    const updateTime = new Date(2023, 0, 1, 10, 5, 0); // 5 minutes later
    vi.setSystemTime(updateTime);
    const updatedProject = project.changeName(newName);

    expect(updatedProject.name().value()).toBe('New Test Project Name');
    expect(updatedProject.id().equals(project.id())).toBe(true);
    expect(updatedProject.description().equals(project.description())).toBe(true);
    expect(updatedProject.createdAt()).toEqual(initialTime);
    expect(updatedProject.updatedAt()).toEqual(updateTime);
    expect(updatedProject.updatedAt().getTime()).toBeGreaterThan(project.updatedAt().getTime());
  });

  it('should throw EntityError if new name is null or undefined for changeName', () => {
    const project = Project.create(defaultProps);
    expect(() => project.changeName(null as any)).toThrow(EntityError);
    expect(() => project.changeName(undefined as any)).toThrow(EntityError);
  });

  it('should allow changing the project description and update updatedAt', () => {
    const initialTime = new Date(2023, 0, 1, 11, 0, 0);
    vi.setSystemTime(initialTime);
    const project = Project.create(defaultProps);

    const newDescription = ProjectDescription.create('Updated project description.');
    const updateTime = new Date(2023, 0, 1, 11, 5, 0);
    vi.setSystemTime(updateTime);
    const updatedProject = project.changeDescription(newDescription);

    expect(updatedProject.description().value()).toBe('Updated project description.');
    expect(updatedProject.id().equals(project.id())).toBe(true);
    expect(updatedProject.name().equals(project.name())).toBe(true);
    expect(updatedProject.createdAt()).toEqual(initialTime);
    expect(updatedProject.updatedAt()).toEqual(updateTime);
  });

  it('should throw EntityError if new description is null or undefined for changeDescription', () => {
    const project = Project.create(defaultProps);
    expect(() => project.changeDescription(null as any)).toThrow(EntityError);
    expect(() => project.changeDescription(undefined as any)).toThrow(EntityError);
  });

  it('should correctly compare two Project entities using AbstractEntity equals (by ID)', () => {
    const id = ProjectId.generate();
    const project1 = Project.create({ ...defaultProps, id });
    const project2 = Project.create({
      id,
      name: ProjectName.create('Another Name'),
      description: ProjectDescription.create('Another description.'),
    });
    const project3 = Project.create(defaultProps); // Different ID

    expect(project1.equals(project2)).toBe(true);
    expect(project1.equals(project3)).toBe(false);
    expect(project1.equals(undefined)).toBe(false);
    expect(project1.equals(null)).toBe(false);
  });
});
