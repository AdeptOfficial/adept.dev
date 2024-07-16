export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className='container'>
                <h2>Authorizing</h2>
            </div>
            {children}

        </>
    );
}
