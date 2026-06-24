import {
  createProjectDb,
  getProjectsByOwnerDb,
  getProjectByIdDb,
  updateProjectDb,
  deleteProjectDb,
} from "./repository";
import { CreateProjectInput, UpdateProjectInput } from "./types";

export async function createProject(ownerId: string, input: CreateProjectInput) {
  return await createProjectDb(ownerId, input);
}

export async function getProjectsByOwner(ownerId: string) {
  return await getProjectsByOwnerDb(ownerId);
}

export async function getProjectById(id: string, ownerId: string) {
  const project = await getProjectByIdDb(id, ownerId);
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}

export async function updateProject(id: string, ownerId: string, input: UpdateProjectInput) {
  // Verify ownership and existence first
  await getProjectById(id, ownerId);
  return await updateProjectDb(id, ownerId, input);
}

export async function deleteProject(id: string, ownerId: string) {
  // Verify ownership and existence first
  await getProjectById(id, ownerId);
  return await deleteProjectDb(id, ownerId);
}
