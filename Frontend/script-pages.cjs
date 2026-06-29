const fs = require('fs');
const path = require('path');

const modulesDir = 'c:/Users/XIAOMI/WBI/Frontend/src/modules';

const routeFiles = [
  'user/routes/index.jsx',
  'vendor/routes/index.jsx',
  'worker/routes/index.jsx',
  'engineer/routes/index.jsx',
  'admin/routes/index.jsx'
];

routeFiles.forEach(file => {
  const filePath = path.join(modulesDir, file);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping ' + file);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('AnimatedPage')) {
    content = content.replace(
      /import \{ Routes, Route, useLocation \} from 'react-router-dom';/g,
      "import { Routes, Route, useLocation } from 'react-router-dom';\nimport { AnimatePresence } from 'framer-motion';\nimport AnimatedPage from '../../../components/common/AnimatedPage';"
    );
    
    // Vendor might use just Routes, Route
    if (!content.includes("import { AnimatePresence }")) {
       content = content.replace(
         /import \{ Routes, Route \} from 'react-router-dom';/g,
         "import { Routes, Route, useLocation } from 'react-router-dom';\nimport { AnimatePresence } from 'framer-motion';\nimport AnimatedPage from '../../../components/common/AnimatedPage';"
       );
    }
    
    // Replace <Routes> with <AnimatePresence><Routes key={location.pathname}>
    content = content.replace(
      /<Routes>/g,
      "<AnimatePresence mode=\"wait\">\n            <Routes location={location || undefined} key={location ? location.pathname : 'routes'}>"
    );
    
    content = content.replace(
      /<\/Routes>/g,
      "</Routes>\n            </AnimatePresence>"
    );
    
    // Now wrap the element content in <AnimatedPage>
    content = content.replace(
      /element=\{<(ProtectedRoute|PublicRoute|Route)([^>]+)>([\s\S]*?)<\/\1>\}/g,
      (match, p1, p2, p3) => {
        return `element={<AnimatedPage><${p1}${p2}>${p3}</${p1}></AnimatedPage>}`;
      }
    );
    
    // Also wrap the simple elements like element={<Dashboard />}
    content = content.replace(
      /element=\{<([A-Z][a-zA-Z0-9]+)\s*\/>\}/g,
      (match, p1) => {
        if (p1 === 'AnimatedPage') return match;
        return `element={<AnimatedPage><${p1} /></AnimatedPage>}`;
      }
    );

    // If location is not defined in the component, we must define it!
    if (!content.includes("const location = useLocation();")) {
        content = content.replace(
            /(const [a-zA-Z]+Routes = \(\) => \{)/,
            "$1\n  const location = useLocation();"
        );
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  } else {
    console.log('Already updated ' + file);
  }
});
