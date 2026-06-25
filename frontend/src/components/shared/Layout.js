import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children, title }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="cg-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="cg-main">
        <Topbar title={title} onMenuToggle={() => setMobileOpen(true)} />
        <motion.main 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="cg-content"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
