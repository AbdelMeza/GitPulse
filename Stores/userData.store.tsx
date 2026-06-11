import { create } from "zustand";
import API_URL from "./api_url";

export interface GitHubUser {
  identity: {
    id: number;
    username: string;
    name: string;
    avatar: string;
    bio: string;
    company: string | null;
    location: string | null;
    followers: number;
    following: number;
  };
  stats: {
    public_repos_count: number;
    total_stars_received: number;
    top_languages: string[];
    current_month_contributions: number,
    total_lifetime_contributions: number,
    longest_streak: number,
    performance_delta_percent: number,
  };
  commit_history_30_days: {
    date: string;
    commits: number;
  }[];
  recent_repositories: {
    id: number;
    name: string;
    description: string | null;
    url: string;
    language: string | null;
    stars: number;
    forks: number;
    updated_at: string;
  }[];
  recent_activities: {
    id: string;
    type: string;
    repo: string;
    title: string;
    date: string;
    url: string;
  }[];
}

type userDataStoreType = {
  user_data: GitHubUser | null;
  loading_state: boolean;
  get_user_data: () => Promise<void>;
}

const useUserDataStore = create<userDataStoreType>((set) => ({
  user_data: null,
  loading_state: false,

  get_user_data: async () => {
    try {
      set({ loading_state: true });

      const res = await fetch(`${API_URL}/user/profile`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();

      set({ user_data: data, loading_state: false });

      console.log("User data loaded successfully:", data);

    } catch (error) {
      console.error("Error fetching user data:", error);
      set({ user_data: null, loading_state: false });
    }
  }
}));

export default useUserDataStore;