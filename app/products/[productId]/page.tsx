export default function ProductDetails( { params }: {
    params: { productId: string } // param is object with key with type String
} ) {
    return (
        <div className='container'>
        <h1>About Product {params.productId} </h1>
    </div>
    )
}