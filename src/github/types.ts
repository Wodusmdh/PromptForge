export interface GitHubConnectionState {
  status: "DISCONNECTED" | "CONNECTED" | "AUTH_EXPIRED" | "ERROR";
  user?: {
    username: string;
    avatarUrl?: string;
  };
  error?: string;
}

export interface RepositoryMetadata {
  owner: string;
  name: string;
  id?: string;
  defaultBranch: string;
  url: string;
}

export interface BranchModel {
  name: string;
  commitSha: string;
  isDefault: boolean;
}

export interface GitHubFile {
  path: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  sha: string;
  encoding?: string;
}

export interface GitHubDirectoryItem {
  path: string;
  name: string;
  type: "file" | "dir";
  sha: string;
}

export interface GitHubSearchResult {
  path: string;
  name: string;
  sha: string;
  repository: RepositoryMetadata;
}

export interface ChangePlanFile {
  path: string;
  reason: string;
  plannedChange: string;
}

export interface ChangePlan {
  goal: string;
  affectedFiles: ChangePlanFile[];
  dependencies: string[];
  risks: string[];
  validation: string;
}

export interface DiffPreview {
  targetBranch: string;
  affectedFiles: {
    path: string;
    additions: number;
    deletions: number;
    patch: string; // The git diff patch
  }[];
  commitMessage: string;
  validationStatus: "PENDING" | "VALIDATED" | "FAILED";
}

export type GitHubOperationErrorCategory =
  | "GITHUB_AUTH_REQUIRED"
  | "GITHUB_AUTH_EXPIRED"
  | "REPOSITORY_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "BRANCH_NOT_FOUND"
  | "FILE_NOT_FOUND"
  | "RATE_LIMITED"
  | "CONTENT_TOO_LARGE"
  | "SEARCH_FAILED"
  | "NETWORK_ERROR"
  | "GITHUB_API_ERROR"
  | "UNSUPPORTED_OPERATION";

export class GitHubError extends Error {
  constructor(
    public category: GitHubOperationErrorCategory,
    public originalError?: any,
    message?: string
  ) {
    super(message || `${category} from GitHub integration`);
    this.name = "GitHubError";
  }
}
