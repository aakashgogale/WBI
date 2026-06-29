const fs = require('fs');
const path = require('path');

const modulesDir = 'c:/Users/XIAOMI/WBI/Frontend/src/modules';
const roles = ['user', 'vendor', 'worker', 'engineer'];

roles.forEach(role => {
  const bottomNavPath = path.join(modulesDir, role, 'components/layout/BottomNav.jsx');
  const headerPath = path.join(modulesDir, role, 'components/layout/Header.jsx');

  // Process BottomNav
  if (fs.existsSync(bottomNavPath)) {
    let content = fs.readFileSync(bottomNavPath, 'utf8');
    if (!content.includes('useScroll')) {
      if (content.includes('framer-motion')) {
        content = content.replace(
          /import \{ motion(.*?)\} from 'framer-motion';/,
          "import { motion$1, useScroll, useMotionValueEvent } from 'framer-motion';"
        );
      } else {
        content = content.replace(
          /(import React,.*?from 'react';)/,
          "$1\nimport { motion, useScroll, useMotionValueEvent } from 'framer-motion';"
        );
      }
      
      content = content.replace(
        /const BottomNav = (memo\(\(\) => \{|\(\) => \{)/,
        "const BottomNav = $1\n  const { scrollY } = useScroll();\n  const [hidden, setHidden] = React.useState(false);\n  useMotionValueEvent(scrollY, 'change', (latest) => {\n    const prev = scrollY.getPrevious();\n    if (latest > prev && latest > 150) setHidden(true);\n    else setHidden(false);\n  });\n"
      );
      
      content = content.replace(
        /<nav([\s\S]*?)className=\"([^\"]*)\"/,
        "<motion.nav$1className=\"$2\"\n      variants={{ visible: { y: 0 }, hidden: { y: '100%' } }}\n      animate={hidden ? 'hidden' : 'visible'}\n      transition={{ duration: 0.35, ease: 'easeInOut' }}"
      );
      
      content = content.replace(/<\/nav>/g, '</motion.nav>');
      fs.writeFileSync(bottomNavPath, content);
      console.log('Updated BottomNav for ' + role);
    }
  }

  // Process Header
  if (fs.existsSync(headerPath)) {
    let content = fs.readFileSync(headerPath, 'utf8');
    if (!content.includes('useScroll')) {
      if (content.includes('framer-motion')) {
        content = content.replace(
          /import \{ motion(.*?)\} from 'framer-motion';/,
          "import { motion$1, useScroll, useMotionValueEvent } from 'framer-motion';"
        );
      } else {
        content = content.replace(
          /(import React,.*?from 'react';)/,
          "$1\nimport { motion, useScroll, useMotionValueEvent } from 'framer-motion';"
        );
      }
      
      content = content.replace(
        /const Header = (memo\(\(\{[^\}]*\}\) => \{|\(\{[^\}]*\}\) => \{|memo\(\(\) => \{|\(\) => \{)/,
        "const Header = $1\n  const { scrollY } = useScroll();\n  const [hidden, setHidden] = React.useState(false);\n  useMotionValueEvent(scrollY, 'change', (latest) => {\n    const prev = scrollY.getPrevious();\n    if (latest > prev && latest > 100) setHidden(true);\n    else setHidden(false);\n  });\n"
      );
      
      // Make sure the header has "sticky top-0 z-50 bg-white" to be actually sticky and animate properly
      if (!content.includes('sticky')) {
        content = content.replace(
            /className=\"([^\"]*)\"/,
            "className=\"$1 sticky top-0 z-50 bg-white/90 backdrop-blur-md\""
        );
      }

      content = content.replace(
        /<header([\s\S]*?)className=\"([^\"]*)\"/,
        "<motion.header$1className=\"$2\"\n      variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}\n      animate={hidden ? 'hidden' : 'visible'}\n      transition={{ duration: 0.35, ease: 'easeInOut' }}"
      );
      
      content = content.replace(/<\/header>/g, '</motion.header>');
      fs.writeFileSync(headerPath, content);
      console.log('Updated Header for ' + role);
    }
  }
});
