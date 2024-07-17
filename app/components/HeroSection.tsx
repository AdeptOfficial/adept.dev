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
      </div>
    </section>
  )
}

export default HeroSection