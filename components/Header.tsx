import MainMenu from "./MainMenu";

export const Header = () => {
    return (
        <header className="w-full px-6 py-12 flex justify-between items-center border-b border-white/10">
            <MainMenu />
        </header>
    );
}