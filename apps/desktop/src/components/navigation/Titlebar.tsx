import Logo from "./Logo";
import { Minus, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
const appWindow = getCurrentWindow();

document
  .getElementById("titlebar-minimize")
  ?.addEventListener("click", () => appWindow.minimize());
document
  .getElementById("titlebar-maximize")
  ?.addEventListener("click", () => appWindow.toggleMaximize());
document
  .getElementById("titlebar-close")
  ?.addEventListener("click", () => appWindow.close());

export function TitleBarWindowItem({
  option,
}: {
  option: "minimize" | "maximize" | "close";
}) {
  const handleAction = () => {
    switch (option) {
      case "minimize":
        appWindow.minimize();
        break;
      case "maximize":
        appWindow.toggleMaximize();
        break;
      case "close":
        appWindow.close();
        break;
      default:
        break;
    }
  };
  const renderIcon = () => {
    switch (option) {
      case "minimize":
        return <Minus size={18} />;
      case "close":
        return <X size={18} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="inline-flex justify-center items-center h-full aspect-square transition-all hover:bg-gradient-to-b from-white/15 to-transparent hover:text-secondary-foreground cursor-pointer text-primary-foreground"
      id={`titlebar-${option}`}
      onClick={handleAction}
    >
      {renderIcon()}
    </div>
  );
}

export function TitleBar() {
  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-primary select-none flex justify-between items-center fixed top-0 left-0 right-0"
    >
      <Logo className="h-5 hover:fill-primary-foreground cursor-default" />
      <div className="flex justify-end h-full">
        <TitleBarWindowItem option="minimize" />
        {/* <TitleBarWindowItem option="maximize" /> */}
        <TitleBarWindowItem option="close" />
      </div>
    </div>
  );
}