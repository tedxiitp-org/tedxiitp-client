function Video() {
    return (
        <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-8">
            <h1 className="relative z-10 mx-auto text-[45px] sm:text-[70px] md:text-[75px] lg:text-[100px] xl:text-[110px] font-bebas font-normal tracking-wide text-center text-[#EB0028] uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                Theme Video Teaser
            </h1>
            <div className="w-full max-w-6xl aspect-video my-6 sm:my-10 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(235,0,40,0.25)] border border-red-900/30 bg-black">
                <video
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                >
                    <source src="/themeTeaser.mp4" type="video/quicktime" />
                    <source src="/themeTeaser.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}

export default Video;


