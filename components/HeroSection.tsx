import DiscordProfile from "./discord-component/DiscordProfile";
import Portfolio from "./portfolio-component/Portfolio";
import NowPlaying from "./spotify-components/NowPlaying";

const HeroSection = () => {
  return (
    <section className="p-4 mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Section: Introduction */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center">
          <h1 className="text-white mb-4 text-5xl sm:text-6xl lg:text-8xl font-extrabold leading-tight">
            Certified Vibe Coder
          </h1>
          <p className="text-[#ADB7BE] text-xl sm:text-2xl lg:text-4xl">
            Design. Code. Ship. Repeat.
          </p>
        </div>

        {/* Right Section: Profile Picture and Now Playing */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center space-y-6">
          <DiscordProfile />
          <div className="w-full max-w-xs">
            <NowPlaying />
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="mt-16">
        <Portfolio />
      </div>
    </section>
  );
};

export default HeroSection;
