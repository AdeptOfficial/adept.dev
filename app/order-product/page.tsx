"use client"
import { useRouter } from "next/navigation";

export default function OrderProduct() {
    const router = useRouter();
    const handleClick = () => {
        console.log("Placing your order...");
        router.push("/")
    }

    return (
        <div className='container'>
            <h1>Order Product</h1>
            <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" onClick={handleClick}>Place order</button>
        </div>
    )
}