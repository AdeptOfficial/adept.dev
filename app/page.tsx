import Link from 'next/link'
import React from 'react'

export default function Home() {
  return (
    <section className='py-24'>
      <div className='container'>
        <h1 className='text-3xl font-bold'>Welcome to AdepT.dev</h1>
        <h1>
          Read <Link href="/about"> about me!</Link>
        </h1>
        <h1>
          Read <Link href="/blogs"> blogs by me!</Link>
        </h1>
        <h1>
          Buy <Link href="/products"> products!</Link>
        </h1>
      </div>
    </section>
  )
}