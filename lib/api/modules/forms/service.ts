import { getProjectById } from "../projects/service";
import {
  createFormDb,
  getFormsByProjectDb,
  getFormByIdDb,
  updateFormDb,
  deleteFormDb,
  getFormByIdPublicDb,
} from "./repository";
import { CreateFormInput, UpdateFormInput } from "./types";

export async function createForm(ownerId: string, projectId: string, input: CreateFormInput) {
  // Verify ownership of the parent project
  await getProjectById(projectId, ownerId);
  return await createFormDb(projectId, input);
}

export async function getFormsByProject(ownerId: string, projectId: string) {
  // Verify ownership of the parent project
  await getProjectById(projectId, ownerId);
  return await getFormsByProjectDb(projectId);
}

export async function getFormById(id: string, projectId: string, ownerId: string) {
  // Verify ownership of the parent project
  await getProjectById(projectId, ownerId);
  const form = await getFormByIdDb(id, projectId);
  if (!form) {
    throw new Error("Form not found");
  }
  return form;
}

export async function updateForm(
  id: string,
  projectId: string,
  ownerId: string,
  input: UpdateFormInput
) {
  // Verify ownership of project and existence of form
  await getFormById(id, projectId, ownerId);
  return await updateFormDb(id, projectId, input);
}

export async function deleteForm(id: string, projectId: string, ownerId: string) {
  // Verify ownership of project and existence of form
  await getFormById(id, projectId, ownerId);
  return await deleteFormDb(id, projectId);
}

export async function getFormByIdPublic(id: string) {
  const form = await getFormByIdPublicDb(id);
  if (!form) {
    throw new Error("Form not found");
  }
  return form;
}
