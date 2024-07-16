import Link from 'next/link'
import { title } from 'process'
import React from 'react'

export const metadata = {
  title: "About AdepT.dev"
}

export default function About() {
  return (
    <section className='py-24'>
      <div className='container'>
        <h1 className='text-3xl font-bold'>About page</h1>
        <h1>
          Go back <Link href="/">home!</Link>
        </h1>
      </div>
    </section>
  )
}