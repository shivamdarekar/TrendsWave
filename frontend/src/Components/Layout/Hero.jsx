import heroImg from "../../assets/rabbit-hero.webp";
import { Link } from "react-router-dom";

const Hero = () => {
    return (
        <section className="relative w-full">
            {/* Hero Image */}
            <img
                src={heroImg}
                alt="TrendsWave"
                className="w-full h-[350px] md:h-[400px] lg:h-[600px] md:object-cover "
            />

            {/* Hero Content */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white px-6">
                    <h1 className=" text-5xl md:text-7xl font-bold uppercase tracking-wide mb-4">
                        Vacation <br /> Ready
                    </h1>
                    <p className="text-base md:text-lg mb-6 text-shadow">
                        Explore our vacation-ready outfits with fast worldwide shipping.
                    </p>
                    <Link to="/collections/all" className="bg-gradient-to-r from-amber-400 to-yellow-500
                     text-gray-900 px-6  sm:px-10 py-3 sm:py-4 rounded-full text-lg font-bold hover:from-amber-300
                      hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ">
                        Shop Now
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
