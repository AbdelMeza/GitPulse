import "./LoginPage.scss"
import { Contrast } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import c from "../../src/Style/_config.module.scss"
import GitPulseIcon from "../../Components/GitPulseIcon/GitPulseIcon"
import useTheme from "../../Stores/useTheme"

export default function LoginPage() {
    const [queryParams, setQueryParams] = useSearchParams()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const { switchTheme } = useTheme()

    useEffect(() => {
        const errorParam = queryParams.get("auth_error")

        if (errorParam == "denied") {
            setErrorMessage("You have to grant access to continue.")
        } else if (errorParam == "token_failed") {
            setErrorMessage("Failed to retrieve access token, please try again.")
        } else if (errorParam == "server_error") {
            setErrorMessage("Server error, please try again later.")
        }
    }, [queryParams])

    const handleLogin = () => {
        window.location.href = 'http://localhost:2606/api/auth/github';
    }

    return (
        <div className="login-page">
            <div className="switch-theme-btn" onClick={() => switchTheme()}>
                <Contrast width={20} strokeWidth={1.5} color={c.textColorShade200} />
            </div>
            <div className="login-content">
                <div className="upper-content">
                    <div className="logo-container">
                        <GitPulseIcon fill={c.textColorShade100} width={80} />
                        <span className="logo-text">GitPulse</span>
                    </div>
                    <span className="description">
                        Analyze your Git contributions, monitor cognitive load, and get instant, AI-powered code reviews in seconds.
                    </span>
                </div>
                {errorMessage && errorMessage !== null ? <span className="error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="error-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    <span className="error-text">{errorMessage}</span>
                </span> : null}
                <button className="github-auth-btn" onClick={() => handleLogin()} >
                    <GithubSvg fill={c.bgColorShade100} width={25} />
                    <span className="btn-text">Sign in with GitHub</span>
                </button>
                <footer className="login-footer">
                    <span>Secured via GitHub OAuth 2.0 - Your codebase remains private.</span>
                </footer>
            </div>
        </div>
    );
}

function GithubSvg({ fill, width }: { fill: string; width: number }) {
    return <svg className="w-5 h-5 fill-current" fill={fill} width={width} viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
}

