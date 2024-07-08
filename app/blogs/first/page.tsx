import React from 'react'
import Link from 'next/link'

export default function FirstBlog() {
    return (
        <><h1>Learning Nextjs</h1><h1>
            Read More <Link href="/blogs">blogs!</Link>
        </h1></>
    )
}