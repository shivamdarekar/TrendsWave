import { Outlet } from "react-router-dom";
import Footer from "../Common/Footer.jsx";
import Header from "../Common/Header.jsx";

const UserLayout = () => {
    return (
        <>
            {/*Header*/}
            <Header />
            
            {/*Main Content*/}
            <main>
                <Outlet />
            </main>


            {/*Footer*/}
            <Footer/>
        </>
    )
}

export default UserLayout;

// UserLayout is a wrapper for all user pages.
//It keeps the Header and Footer static on every page.
//<Outlet /> changes based on the route (it loads the current page).
//Pages like Home, About, or Contact will appear inside <Outlet />.



