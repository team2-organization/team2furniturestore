import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { IoIosFlame } from 'react-icons/io';

import axios from 'axios';
import { useContext, useState } from 'react';
import { Store } from '../Store';

function Product(props) {
  const { product } = props;
  const [lowCount, setLowCount] = useState(false);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/db/products/${item._id}`);
    console.log(data);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    if (data.countInStock <= 10) {
      setLowCount(true);
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };
  

  return (
    <Card className='hover'>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className='card-img-top' alt={product.name} />
      </Link>
      <Card.Body>
        <Link className='namestyle' to={`/product/${product.slug}`}>
          <Card.Title className='light'>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Title> </Card.Title>

        <Row>
          <Col>
            {' '}
            {/* <div className='noline'> */}
            <p className='big'>${product.price}</p>
            {product.price < 1000 && <sup className='small'>.99</sup>}
            {/* </div> */}
          </Col>
        </Row>

        <div className='flat'>
          {product.countInStock === 0 ? (
            <Button variant='light' disabled>
              Out of stock
            </Button>
          ) : (
            <Button
              style={{
                backgroundColor: 'rgb(185, 56, 14)',
                color: 'white',
                marginTop: '5%',
              }}
              onClick={() => addToCartHandler(product)}
              disabled={lowCount}
            >
              Add to cart
            </Button>
          )}

          {/* <Card.Title className='light'>{product.name}</Card.Title> */}
          {product.countInStock <=  10 ? (
            <Col className='low' style={{ color: 'rgb(185, 56, 14)' }}>
              {' '}
              <strong>{product.countInStock} left </strong> <IoIosFlame />
            </Col>
          ) : (
            <Col></Col>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
export default Product;
