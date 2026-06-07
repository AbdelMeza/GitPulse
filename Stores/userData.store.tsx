import { create } from "zustand";
import API_URL from "./api_url";

interface GitHubUser {
    id: number;
    username: string;
    name: string;
    avatar: string;
    bio: string;
    public_repos: number;
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