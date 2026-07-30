import { 
  GitHubConnectionState, 
  RepositoryMetadata, 
  BranchModel, 
  GitHubFile, 
  GitHubDirectoryItem, 
  GitHubSearchResult,
  GitHubError
} from "./types";

export interface GitHubProviderConfig {
  accessToken?: string;
  maxFileSizeKb?: number;
}

export class GitHubProvider {
  private connectionState: GitHubConnectionState = { status: "DISCONNECTED" };
  private maxFileSize = 1000 * 1000; // 1MB default limit

  constructor(private config: GitHubProviderConfig) {
    if (config.accessToken) {
      this.connectionState = { status: "CONNECTED" };
    }
    if (config.maxFileSizeKb) {
      this.maxFileSize = config.maxFileSizeKb * 1000;
    }
  }

  getConnectionState(): GitHubConnectionState {
    return this.connectionState;
  }

  private async fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.config.accessToken) {
      throw new GitHubError("GITHUB_AUTH_REQUIRED", null, "Access token missing");
    }

    try {
      const response = await fetch(`https://api.github.com${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          "Authorization": `Bearer ${this.config.accessToken}`,
          "Accept": "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      });

      if (!response.ok) {
        if (response.status === 401) throw new GitHubError("GITHUB_AUTH_EXPIRED", response);
        if (response.status === 403) {
          const rateLimit = response.headers.get("x-ratelimit-remaining");
          if (rateLimit === "0") throw new GitHubError("RATE_LIMITED", response);
          throw new GitHubError("PERMISSION_DENIED", response);
        }
        if (response.status === 404) throw new GitHubError("REPOSITORY_NOT_FOUND", response); // Simplified
        if (response.status === 422) throw new GitHubError("UNSUPPORTED_OPERATION", response);
        throw new GitHubError("GITHUB_API_ERROR", response, `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (e: any) {
      if (e instanceof GitHubError) throw e;
      throw new GitHubError("NETWORK_ERROR", e, e.message);
    }
  }

  async getRepository(owner: string, name: string): Promise<RepositoryMetadata> {
    const data = await this.fetchApi(`/repos/${owner}/${name}`);
    return {
      owner: data.owner.login,
      name: data.name,
      id: data.id.toString(),
      defaultBranch: data.default_branch,
      url: data.html_url
    };
  }

  async getBranch(owner: string, name: string, branch: string): Promise<BranchModel> {
    try {
      const data = await this.fetchApi(`/repos/${owner}/${name}/branches/${branch}`);
      return {
        name: data.name,
        commitSha: data.commit.sha,
        isDefault: false // requires checking repo metadata, simplifed here
      };
    } catch (e: any) {
      if (e.category === "REPOSITORY_NOT_FOUND") throw new GitHubError("BRANCH_NOT_FOUND", e.originalError);
      throw e;
    }
  }

  async listDirectory(owner: string, name: string, path: string, ref?: string): Promise<GitHubDirectoryItem[]> {
    const query = ref ? `?ref=${ref}` : "";
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const data = await this.fetchApi(`/repos/${owner}/${name}/contents/${cleanPath}${query}`);
    
    if (!Array.isArray(data)) {
      // It's a file, not a directory
      throw new GitHubError("UNSUPPORTED_OPERATION", null, "Path is a file, not a directory");
    }

    return data.map((item: any) => ({
      path: item.path,
      name: item.name,
      type: item.type === "dir" ? "dir" : "file",
      sha: item.sha
    }));
  }

  async getFile(owner: string, name: string, path: string, ref?: string): Promise<GitHubFile> {
    const query = ref ? `?ref=${ref}` : "";
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    try {
      const data = await this.fetchApi(`/repos/${owner}/${name}/contents/${cleanPath}${query}`);
      
      if (Array.isArray(data)) {
        throw new GitHubError("UNSUPPORTED_OPERATION", null, "Path is a directory, not a file");
      }
      
      if (data.size > this.maxFileSize) {
        throw new GitHubError("CONTENT_TOO_LARGE", null, `File size ${data.size} exceeds limit ${this.maxFileSize}`);
      }
      
      // Ensure it's not exposing simple secrets blindly
      let contentDecoded = "";
      if (data.content && data.encoding === "base64") {
        contentDecoded = Buffer.from(data.content, "base64").toString("utf-8");
        // Simple redactor check
        contentDecoded = this.redactSecrets(contentDecoded);
      }

      return {
        path: data.path,
        name: data.name,
        type: data.type,
        size: data.size,
        sha: data.sha,
        encoding: "utf-8",
        content: contentDecoded
      };
    } catch (e: any) {
       if (e.category === "REPOSITORY_NOT_FOUND") throw new GitHubError("FILE_NOT_FOUND", e.originalError);
       throw e;
    }
  }

  async searchRepository(owner: string, name: string, query: string): Promise<GitHubSearchResult[]> {
    try {
      const q = encodeURIComponent(`${query} repo:${owner}/${name}`);
      const data = await this.fetchApi(`/search/code?q=${q}`);
      
      return (data.items || []).map((item: any) => ({
        path: item.path,
        name: item.name,
        sha: item.sha,
        repository: {
          owner: item.repository.owner.login,
          name: item.repository.name,
          defaultBranch: "main",
          url: item.repository.html_url
        }
      }));
    } catch (e) {
      throw new GitHubError("SEARCH_FAILED", e);
    }
  }
  
  private redactSecrets(content: string): string {
    // Basic redaction layer for common secret patterns
    // e.g. looking for things like "ghp_xxxxxxxxxxxxxxxxxxx"
    let safeContent = content;
    const ghpPattern = /ghp_[a-zA-Z0-9]{36}/g;
    const bearerPattern = /Bearer\s+[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/g;
    
    safeContent = safeContent.replace(ghpPattern, "ghp_[REDACTED]");
    safeContent = safeContent.replace(bearerPattern, "Bearer [REDACTED]");
    return safeContent;
  }
}
