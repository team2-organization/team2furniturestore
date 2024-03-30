import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import Button from 'react-bootstrap/Button';
import { getError } from './utils';
import axios from 'axios';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import Rating from './components/Rating';
import BSearchScreen from './screens/BSearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import ProductCreateScreen from './screens/ProductCreateScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import RefundListScreen from './screens/RefundListScreen';
import RefundScreen from './screens/RefundScreen';
import UserEditScreen from './screens/UserEditScreen';
import MapScreen from './screens/MapScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import { MdOutlineLightMode } from 'react-icons/md';
import { MdOutlineDarkMode } from 'react-icons/md';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;

  // axios.defaults.baseURL = 'http://localhost:4000/';
  axios.defaults.baseURL = 'https://team2furniturestore.onrender.com/';


  
  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    localStorage.removeItem('cartItems');
    window.location.href = '/signin';
  };
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [rating, setRating] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/db/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/db/products/brands`);
        setBrands(data);
 
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
 const starRatings = ["0 - 499","500 - 1499","1500 - 4999","5000 - 9999","10000 - 14999"]
  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const { data } = await axios.get(`/db/products/allratings`);
  //       setBrands(data);
 
  //     } catch (err) {
  //       toast.error(getError(err));
  //     }
  //   };
  //   fetchCategories();
  // }, []);
 
  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen
            ? fullBox
              ? 'site-container active-cont d-flex flex-column full-box'
              : 'site-container active-cont d-flex flex-column'
            : fullBox
            ? 'site-container  d-flex flex-column full-box'
            : 'site-container  d-flex flex-column'
        }
      >
        <ToastContainer position='bottom-center' limit={1} />
        <header>
          <Navbar className='navstyle' expand='lg'>
            <Container>
              <Button onClick={() => setSidebarIsOpen(!sidebarIsOpen)}>
                <i className=' fas fa-bars'></i>
              </Button>

              <LinkContainer style={{ color: 'white' }} to='/'>
                <Navbar.Brand> Team 2 Furniture store</Navbar.Brand>
              </LinkContainer>
              <LinkContainer style={{ color: 'white' }} to='/'>
                <Navbar.Brand>
                  {/* {dark ? (
            
            <MdOutlineLightMode className="toggleButton" onClick={handleLight} />
          ) : (
            <MdOutlineDarkMode className="toggleButton" onClick={handleLight} />
          )} */}
                </Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls='basic-navbar-nav' />
              <Navbar.Collapse id='basic-navbar-nav'>
                {/* <SearchBox /> */}
                <Nav className='me-auto  w-100   justify-content-end'>
                  <Link
                    style={{ color: 'white' }}
                    to='/cart'
                    className='nav-link'
                  >
                    Cart
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg='danger'>
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id='basic-nav-dropdown'>
                      <LinkContainer to='/profile'>
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to='/orderhistory'>
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <Link
                        className='dropdown-item'
                        to='#signout'
                        onClick={signoutHandler}
                      >
                        Sign Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className='nav-link' to='/signin'>
                      Sign In
                    </Link>
                  )}
                  {userInfo && userInfo.isAdmin === 'true' && (
                    <NavDropdown title='Admin' id='admin-nav-dropdown'>
                      <LinkContainer to='/admin/dashboard'>
                        <NavDropdown.Item>Reports</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to='/admin/products'>
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to='/admin/orders'>
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to='/admin/users'>
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to='/admin/refunds'>
                        <NavDropdown.Item>Refund Requests</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column '
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className=' flex-column text-white w-100 p-2'>
            <Nav.Item>
              <strong style={{color: "black"}}>Categories</strong>
            </Nav.Item>
            <div style={{ border: '2px solid rgb(185, 56, 14)', borderRadius: '10px', marginBottom: "1rem",  }}>   
            
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
  <Nav className="flex-column">
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={{ pathname: '/search', search: `category=${category}` }}
      
                >
                  <Nav.Link className='namestyle '>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
            
            </Nav>
</div>
</div>

            <Nav.Item>
              <strong style={{color: "black"}}>Brands</strong>
            </Nav.Item>
            <div style={{ border: '2px solid rgb(185, 56, 14)', borderRadius: '10px', marginBottom: "1rem", }}>    
<div style={{ maxHeight: '300px', overflowY: 'auto' }}>
  <Nav className="flex-column">
    {brands.map((brand) => (
      <Nav.Item key={brand} style={{ width: '100%' }}>
        <LinkContainer
          to={{ pathname: '/bsearch', search: `brand=${brand}` }}
          // onClick={() => setSidebarIsOpen(false)}
        >
          <Nav.Link className='namestyle'>{brand}</Nav.Link>
        </LinkContainer>
      </Nav.Item>
    ))}
  </Nav>
</div>
</div>

{/* <Nav.Item>
              <strong style={{color: "black"}}>Price</strong>
            </Nav.Item> */}
{/*         
<div style={{ maxHeight: '300px', overflowY: 'auto' }}>
  <Nav className="flex-column">
    {starRatings.map((starRating) => (
      <Nav.Item key={starRating} style={{ width: '100%' }}>
        <LinkContainer
          to={{ pathname: '/rsearch', search: `starRating=${starRating}` }}
          // onClick={() => setSidebarIsOpen(false)}
        >
          <Nav.Link className='namestyle'>{starRating}</Nav.Link>
        </LinkContainer>
      </Nav.Item>
    ))}
  </Nav>
</div>
 */}

 
 
 

          </Nav>
        </div>
        <main>
          <Container className='mt-3'>
            <Routes>
              <Route path='/product/:slug' element={<ProductScreen />} />
              <Route path='/cart' element={<CartScreen />} />
              <Route path='/search' element={<SearchScreen />} />
              <Route path='/bsearch' element={<BSearchScreen />} />
              <Route path='/signin' element={<SigninScreen />} />
              <Route path='/signup' element={<SignupScreen />} />
              <Route
                path='/forget-password'
                element={<ForgetPasswordScreen />}
              />
              <Route
                path='/reset-password/:token'
                element={<ResetPasswordScreen />}
              />

              <Route
                path='/profile'
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/map'
                element={
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                }
              />
              <Route path='/placeorder' element={<PlaceOrderScreen />} />
              <Route
                path='/order/:id'
                element={
                  <ProtectedRoute>
                    <OrderScreen />
                  </ProtectedRoute>
                }
              ></Route>
               <Route
                path='/refund/:id'
                element={
                  <ProtectedRoute>
                    <RefundScreen />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path='/orderhistory'
                element={
                  <ProtectedRoute>
                    <OrderHistoryScreen />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path='/shipping'
                element={<ShippingAddressScreen />}
              ></Route>
              <Route path='/payment' element={<PaymentMethodScreen />}></Route>
              {/* Admin Routes */}
              <Route
                path='/admin/dashboard'
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path='/admin/orders'
                element={
                  <AdminRoute>
                    <OrderListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path='/admin/users'
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path='/admin/products'
                element={
                  <AdminRoute>
                    <ProductListScreen />
                  </AdminRoute>
                }
              ></Route>
               <Route
                path='/admin/refunds'
                element={
                  <AdminRoute>
                    <RefundListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path='/admin/product/:id'
                element={
                  <AdminRoute>
                    <ProductEditScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path='/admin/product/newproduct'
                element={
                  <AdminRoute>
                    <ProductCreateScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path='/admin/user/:id'
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              ></Route>

              <Route path='/' element={<HomeScreen />} />
            </Routes>
          </Container>
        </main>
        <footer>
          <div className='text-center'>All rights reserved</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;



