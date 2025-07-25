import Topbar from "../Layout/Topbar.jsx";
import Navbar from "./Navbar.jsx";

const Header = () => {
    return (
        <header className="border-b border-gray-300">
            {/* topbar */}
            <Topbar />
            
            {/* navbar */}
            <Navbar />
            
            {/* cart drawer */}
        </header>
    )
}


export default Header;