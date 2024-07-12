import React from 'react'

const HeroSection = () => {
  return (
    <section>
      <div className='grid grid-cols-1 lg:grid-cols-12'>
        <div className='col-span-7 place=self-center'>
          <h1 className='text-white mb-4 text-4xl lg:text-6xl font-extrabold'> Hello, I'm AdepT </h1>
          <p className='text-[#ADB7BE] text-lg lg:text-xl'> hello world, This is plain text, hello again, please say hi back lol
          </p>
        </div>
        <div className='col-span-5'></div>
      </div>
    </section>
  )
}

export default HeroSection