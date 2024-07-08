export default function ReviewDetails( { params }: {
    params: { 
        productId: string;
        reviewId: string;
    }; // param is object with key with type String
}) {
    return (
        <div className='container'>
            <h1> Review { params.reviewId } for Product {params.productId} </h1>
        </div>
    )
}