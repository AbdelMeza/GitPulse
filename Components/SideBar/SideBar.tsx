import GitPulseIcon from "../GitPulseIcon/GitPulseIcon"

export default function SideBar() {
    return <div className="sidebar">
        <div className="upper-content">
            <div className="gitpulse-icon">
                <GitPulseIcon fill={"#fff"} width={20} />
                <span className="icon-text">GitPulse</span>
            </div>
        </div>
        <div className="middle-content"></div>
        <div className="lower-content"></div>
    </div>
}