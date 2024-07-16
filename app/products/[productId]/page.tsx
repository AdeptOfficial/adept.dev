import { Metadata } from "next"

type Props = {
    params: {
        productId: string
    }
}

export const generateMetadata = ({ params }: Props): Metadata => {
    return {
        title: `Product ${params.productId}`,
    }
}

export default function ProductDetails({ params }: Props) {
    return (
        <div className='container'>
            <h1>About Product {params.productId} </h1>
        </div>
    )
}