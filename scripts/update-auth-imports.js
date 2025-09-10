const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/userPage/Signup.jsx',
  'src/userPage/Login.jsx',
  'src/pages/AppointmentsPage.jsx',
  'src/adminPage/Login.jsx',
  'src/adminPage/pages/Profile.jsx',
  'src/adminPage/data/AdminSidebar.jsx'
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace the import
    content = content.replace(
      /from ['"](.*?\/)?contexts\/AuthContext['"]/g,
      'from "../hooks/useAuth"'
    );
    
    // If using useContext(AuthContext), replace with useAuth()
    content = content.replace(
      /const \{.*\} = useContext\(AuthContext\)/g,
      'const { $& } = useAuth()'.replace('const { const {', 'const {')
    );
    
    // Add useAuth to imports if not already there
    if (content.includes('useAuth') && !content.includes('import { useAuth }')) {
      content = content.replace(
        /import \{/,
        'import { useAuth, '
      );
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
});

console.log('All auth imports have been updated!');
