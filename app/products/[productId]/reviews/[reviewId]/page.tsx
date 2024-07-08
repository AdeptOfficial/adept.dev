import { notFound } from "next/navigation"

export default function ReviewDetails( { params }: {
    params: { 
        productId: string;
        reviewId: string;
    }; // param is object with key with type String
}) {
    if (parseInt(params.reviewId) > 1000) {
        notFound();
    }
    return (
        <div className='container'>
            <h1> Review { params.reviewId } for Product {params.productId} </h1>
        </div>
    )
}