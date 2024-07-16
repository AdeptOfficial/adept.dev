import Link from "next/link";

export default function ProductList() {
    const products = ['coffee', 'water', 'milk']
    // eslint-disable-next-line react/jsx-key
    const listItems = products.map((p, i=0) => <Link key={p} href={`products/${p}`}> {i +". " + p} <br></br></Link> 
      );
    return(
        <div className='container'>
            <h1>Product List</h1>
            <ul>{listItems}</ul>
            <Link href="products/4" replace>Product 4</Link>
        </div>
    )
}