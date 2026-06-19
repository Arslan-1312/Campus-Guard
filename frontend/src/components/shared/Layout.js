import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children, title }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="cg-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="cg-main">
        <Topbar title={title} onMenuToggle={() => setMobileOpen(true)} />
        <main className="cg-content page-enter">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
