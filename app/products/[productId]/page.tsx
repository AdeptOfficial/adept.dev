export default function ProductDetails( { params }: {
    params: { productId: String } // param is object with key with type String
} ) {
    return (
        <div className='container'>
        <h1>About Product {params.productId} </h1>
    </div>
    )
}