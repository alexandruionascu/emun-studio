import './Navbar.css';

export const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-list">
                <span className="navbar-item-title">Emun.io</span>
                <span className="navbar-item">Dashboard</span>
                <span className="navbar-item">Courses</span>
                <span className="navbar-item">Profile</span>
            </div>
        </nav>
    )
}
