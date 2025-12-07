import { auth } from "@/auth"
import { Sidebar } from "../Sidebar";
import { HeaderContent } from "../HeaderContent";

const Header = async () => {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const isSubscribed = (session?.user as any)?.subscribed;

    return (
        <>
            {session?.user && <Sidebar userRole={userRole} isSubscribed={isSubscribed} />}
            <HeaderContent user={session?.user} userRole={userRole} isSubscribed={isSubscribed} />
        </>
    )
}

export default Header;