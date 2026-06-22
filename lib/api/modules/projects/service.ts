import { ProjectRepository } from "./repository";
import { CreateProjectInput, UpdateProjectInput } from "./types";

export class ProjectService {
  static async createProject(ownerId: string, input: CreateProjectInput) {
    return await ProjectRepository.create(ownerId, input);
  }

  static async getProjectsByOwner(ownerId: string) {
    return await ProjectRepository.findByOwner(ownerId);
  }

  static async getProjectById(id: string, ownerId: string) {
    const project = await ProjectRepository.findById(id, ownerId);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }

  static async updateProject(id: string, ownerId: string, input: UpdateProjectInput) {
    // Verify ownership and existence first
    await this.getProjectById(id, ownerId);
    return await ProjectRepository.update(id, ownerId, input);
  }

  static async deleteProject(id: string, ownerId: string) {
    // Verify ownership and existence first
    await this.getProjectById(id, ownerId);
    return await ProjectRepository.delete(id, ownerId);
  }
}
