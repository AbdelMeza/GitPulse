import { create } from "zustand";

type statusStoreTypes = {
    logoutConfirmationStatus: boolean
    setLogoutConfirmationStatus: () => void
}

const useStatusStore = create<statusStoreTypes>((set) => ({
    logoutConfirmationStatus: false,

    setLogoutConfirmationStatus: () => set((state) => ({
        logoutConfirmationStatus: !state.logoutConfirmationStatus,
    })),
}))

export default useStatusStore