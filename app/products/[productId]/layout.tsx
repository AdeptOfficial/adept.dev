export default function ProductDetailsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
            <div className='container'>
                <h2>Features Products</h2>
            </div>

        </>
    );
}
