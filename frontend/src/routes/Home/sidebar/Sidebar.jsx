import { MdHomeFilled } from "react-icons/md";
import { IoDocumentAttach } from "react-icons/io5";
import { PiCircuitryFill } from "react-icons/pi";
import { NavLink } from "react-router";

const navElements = [
    {
        title: "Home",
        icon: <MdHomeFilled />,
        link: "/",
    },
    {
        title: "Question",
        icon: <IoDocumentAttach/>,
        link: "/questions",
    },
    {
        title: "Quiz",
        icon: < PiCircuitryFill/>,
        link: "/quiz",
    },
]
function Sidebar() {
    return (
        <>
            <div className="h-full flex flex-col bg-gray-800 py-10 font-raleway">
                {navElements.map((element, index) => (
                    <NavLink 
                        key={index} 
                        to={element.link} 
                        className={({ isActive }) =>
                        `text-white flex px-4 py-2 items-center text-xl rounded-lg ${isActive ? 'bg-gray-700' : ''}`}>
                        {element.icon}
                        <span className="ml-4">{element.title}</span>
                    </NavLink>
                ))}
            </div>
        </>
    )
}

export default Sidebar
