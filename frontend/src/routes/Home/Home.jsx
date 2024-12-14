import { Outlet } from "react-router"
import Sidebar from "./sidebar/Sidebar"


function Home() {
    return (
        <>
            <div style={{fontFamily:'Raleway, sans-serif'}} className="grid grid-cols-9 bg-gray-100 h-screen font-raleway ">
                <div className="col-span-2 h-full">
                    <Sidebar/>
                </div>
                <div className="col-span-7 h-full">
                    <Outlet/>
                </div>
                
            </div>
            
        </>
    )
}

export default Home
