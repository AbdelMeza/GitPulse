import useStatusStore from "../../../Stores/status.store"
import useUserDataStore from "../../../Stores/userData.store";
import "./LogoutConfirmation.scss"

export default function logoutConfirmation() {
    const { logoutConfirmationStatus: status, setLogoutConfirmationStatus: setStatus } = useStatusStore()
    const { clearData } = useUserDataStore()

    const handleLogout = async (): Promise<void> => {
        try {
            await fetch("/api/logout", { method: "POST" });

            clearData()
            window.location.href = "/login";
        } catch (error) {
            console.error("Erreur lors de la déconnexion", error);
        }
    }

    return <div className={`logout-confirmation ${status ? "open" : ""}`}>
        <div className="content">
            <div className="upper-content">
                <span className="logout-title">Confirm lgout</span>
                <span className="confirmation-text">Are you sure you want to log out of GitPulse?</span>
            </div>
            <div className="lower-content">
                <button className="btn confirm-btn" onClick={() => handleLogout()}>Logout</button>
                <button className="btn cancel-btn" onClick={() => setStatus()}>Cancel</button>
            </div>
        </div>
    </div>
}