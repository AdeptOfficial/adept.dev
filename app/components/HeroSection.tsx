import DiscordProfile from "./DiscordProfile";
import Portfolio from "./Profolio";

const HeroSection = () => {
  return (
    <section className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Introduction */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center">
          <h1 className="text-white mb-4 text-6xl lg:text-8xl font-extrabold">
            {/* Hello, I&#39;m AdepT */}
            Certified Vibe Coder
          </h1>
          <p className="text-[#ADB7BE] text-3xl lg:text-5xl">
            Design. Code. Ship. Repeat.
          </p>
        </div>

        {/* Right Section: Profile Picture */}
        <div className="col-span-1 lg:col-span-5 flex justify-center items-center">
          <DiscordProfile />
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="mt-8">
        <Portfolio />
      </div>
    </section>
  );
};

export default HeroSection;