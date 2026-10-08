const fs = require('fs');
const path = require('path');

const pages = [
  'pages/public/Home.jsx',
  'pages/public/Products.jsx',
  'pages/public/ProductDetails.jsx',
  'pages/public/Cart.jsx',
  'pages/public/Wishlist.jsx',
  'pages/public/NotFound.jsx',
  'pages/auth/Login.jsx',
  'pages/auth/Register.jsx',
  'pages/customer/Checkout.jsx',
  'pages/customer/OrderSuccess.jsx',
  'pages/customer/Dashboard.jsx',
  'pages/customer/Profile.jsx',
  'pages/customer/Addresses.jsx',
  'pages/customer/MyOrders.jsx',
  'pages/customer/OrderDetails.jsx',
  'pages/customer/Notifications.jsx',
  'pages/admin/AdminDashboard.jsx',
  'pages/admin/ManageProducts.jsx',
  'pages/admin/ManageOrders.jsx'
];

pages.forEach(file => {
  const fullPath = path.join(__dirname, 'src', file);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const componentName = path.basename(file, '.jsx');
  const content = `const ${componentName} = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">${componentName} Page</h1>
      <p>This is a placeholder for the ${componentName} page.</p>
    </div>
  );
};

export default ${componentName};
`;

  fs.writeFileSync(fullPath, content);
  console.log(`Created ${fullPath}`);
});
