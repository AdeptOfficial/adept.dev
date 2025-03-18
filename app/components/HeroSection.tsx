import DiscordProfile from "./DiscordProfile"

const HeroSection = () => {
  return (
    <section>
      <div className='grid grid-cols-1 lg:grid-cols-12'>
        <div className='col-span-7 place=self-center'>
          <h1 className='text-white mb-4 text-6xl lg:text-8xl font-extrabold'> Hello, I'm AdepT </h1>
          <p className='text-[#ADB7BE] text-3xl lg:text-5xl'> I am a Software Engineer
          </p>
        </div>
        <DiscordProfile />



        <div className='col-span-5 flex flex-col items-center justify-center'></div>
        <div className='col-span-12 mt-8'>
          <details className="bg-gray-800 rounded-lg p-4">
            <summary className='text-white text-xl cursor-pointer'>Learn more about me</summary>
            <p className='text-[#ADB7BE] mt-4'>
              I specialize in building scalable web applications and have a passion for learning new technologies.
            </p>
          </details>
        </div>
      </div>
    </section>
  )
}

export default HeroSection