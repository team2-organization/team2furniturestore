import { useEffect, useReducer, useState, useContext } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';
// import data from '../data';
import { FaShoppingCart } from "react-icons/fa";
import { FaBell } from "react-icons/fa";



const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });
  // const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/db/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }

      // setProducts(result.data);
    };
    fetchData();
  }, []);
  
  let countLessThan10 = 0;

  products.forEach((product) => {
    if (product.countInStock < 10) {
      countLessThan10++;
    }
  });
  
  const reversedData = products ? products.slice().reverse():[];
  return (
    <div className='floater-head'>
      <Helmet>
        <title>Team 2</title>
      </Helmet>
      <h1>New Items</h1>
      {cart.cartItems.length  > 0 ? (
      <Link
                    style={{ color: 'white' }}
                    to='/cart'
                    className='floater'
                  >
                    <FaShoppingCart className='changer'/>
                    {cart.cartItems.length > 0 && (
                      <Badge className='smaller' pill bg='danger'>
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>):(null)
}
    
      { countLessThan10 > 0 && state.userInfo && state.userInfo.isAdmin === "true" ? (
      <Link
    to='/admin/restock'

    
                    style={{ color: 'white' }}
                
                    className='floater2'
                  >
                    
                    <FaBell className='changer2'/>
                    { (
                      <Badge className='smaller2' pill bg='danger'>
                        Redzone
       ({countLessThan10})
                      </Badge>
                    )}
                  </Link>):(null)
}
      <div className='products'>
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant='danger'>{error}</MessageBox>
        ) : (
          <Row>
            {reversedData.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className='mb-3'>
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
export default HomeScreen;
