export default function ProductList() {
    const products = ['1. coffee', '2. water', '3. milk']
    const listItems = products.map((p) => <li> {p} </li>
      );
    return(
        <div className='container'>
            <h1>Product List</h1>
            <ul>{listItems}</ul>
        </div>
    )
}