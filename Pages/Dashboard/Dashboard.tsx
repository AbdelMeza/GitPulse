import React, { useEffect } from "react";
import useUserDataStore from "../../Stores/userData.store"

export default function Dashboard() {
    console.log("React version:", React.version);
    const { get_user_data, user_data } = useUserDataStore()

    useEffect(() => {
        const fetchData = async () => {
            try {
                await get_user_data();
            } catch (err) {
                console.error("Failed to load user in dashboard", err);
            }
        };

        fetchData();
    }, []);

    return <></>
}