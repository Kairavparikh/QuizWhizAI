import Header from "../../components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className = "flex flex-col flex-1 w-full h-screen">
            {children}
        </div>
        
    );
}
