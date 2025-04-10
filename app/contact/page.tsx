// app/contact/page.tsx
export default function Contact() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Contact Me</h1>
            <p className="text-[#ADB7BE]">
              If you have any questions or just want to get in touch, feel free to reach out!
            </p>
          </div>
  
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 text-white">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 rounded-md bg-[#1f1f1f] border border-[#333] text-white placeholder-gray-400"
                placeholder="Your name"
              />
            </div>
  
            <div>
              <label htmlFor="email" className="block mb-1 text-white">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 rounded-md bg-[#1f1f1f] border border-[#333] text-white placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>
  
            <div>
              <label htmlFor="message" className="block mb-1 text-white">Message:</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full px-4 py-2 rounded-md bg-[#1f1f1f] border border-[#333] text-white placeholder-gray-400"
                placeholder="Write your message..."
              ></textarea>
            </div>
  
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-md font-medium"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }
  