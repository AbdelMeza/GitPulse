import "./LogoutBtn.scss"
import { LogOut } from "lucide-react"
import useStatusStore from "../../../Stores/status.store"

export default function LogoutContainer({ size, color }: { size: number, color: string }) {
    const { setLogoutConfirmationStatus } = useStatusStore()

    return <div className="logout-btn" onClick={() => setLogoutConfirmationStatus()}>
        <LogOut width={size} stroke={color} />
    </div>
}