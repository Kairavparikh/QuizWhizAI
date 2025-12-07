const UserPagesLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <div className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    )
}

export default UserPagesLayout;