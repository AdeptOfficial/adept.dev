import React from 'react'
import Link from 'next/link'

export default function Blogs() {
    return (
        <div className='container'>
            <h1>Blogs</h1>
            <Link href="/blogs/first">Learning NextJS!</Link>
            <br></br>
            <Link href="/blogs/second">Learning nested routes!</Link>
            <br></br>
            <Link href="/">Go Home!</Link>
        </div>
    )
}