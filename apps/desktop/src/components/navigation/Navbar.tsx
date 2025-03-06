import Extrusion, { CornerLocation } from "../cosmetic/Extrusion";
import { useLocation, Link } from "react-router-dom";

const links = [
  {
    title: "Home",
    route: "/",
  },
  {
    title: "Live Match",
    route: "/live",
  },
  {
    title: "Matches",
    route: "/matches",
  },
  {
    title: "Sponsors",
    route: "/sponsors",
  },
];

function Navbar() {
  const location = useLocation();

  return (
    <>
      <div className="fixed top-10 left-0 right-0 flex items-center h-11 px-4 justify-between bg-primary">
        <div className="flex space-x-8 items-center justify-start h-full">
          {links.map((link, index) => {
            return (
              <div
                className={`group cursor-pointer flex items-center justify-start pt-1 h-full ${location.pathname == link.route ? "border-b border-accent" : ""}`}
              >
                {link.title == "Live Match" && (
                  <p
                    className={`mr-1 ${location.pathname == link.route ? "text-red-500" : "text-primary-foreground"}`}
                  >
                    &#x2022;
                  </p>
                )}

                <Link
                  key={index}
                  className={`cursor-pointer transition-all text-sm h-full flex items-center pt-1 ${location.pathname == link.route ? "text-accent" : "hover:text-accent text-primary-foreground"}`}
                  to={link.route}
                >
                  {link.title}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end items-center space-x-4 h-full w-16">
          {/* Player profile selector */}
          <div className="bg-fuchsia-400 h-6 aspect-square cursor-pointer"></div>
        </div>
      </div>
      <Extrusion
        className="fixed right-0 top-21 float-right min-w-[15%] border-primary"
        cornerLocation={CornerLocation.BottomLeft}
      />
    </>
  );
}

export { Navbar };
