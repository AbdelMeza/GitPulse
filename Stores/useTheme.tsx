import { create } from "zustand";

const activeTheme = localStorage.getItem("theme")

type useThemeTypes = {
    theme: string | null
    switchTheme: () => void
}

const useTheme = create<useThemeTypes>((set) => ({
    theme: activeTheme,

    switchTheme: () => {
        const currentTheme = document.body.getAttribute("data-theme")

        switch (currentTheme) {
            case "dark":
                localStorage.setItem("theme", "light")
                document.body.setAttribute("data-theme", "light")
                set({ theme: "light" })
                break
            case "light":
                localStorage.setItem("theme", "dark")
                document.body.setAttribute("data-theme", "dark")
                set({ theme: "dark" })
                break
        }
    }
}))

export default useTheme