import React from 'react'
import Link from 'next/link'

export default function SecondBlog() {
    return (
        <div className='container'>
            <h1>Learning Nested Routes</h1><h1>
                Read More <Link href="/blogs">blogs!</Link>
            </h1>
        </div>
    )
}