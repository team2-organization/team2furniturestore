import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CartScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const [lowCount, setLowCount] = useState(false);
  const {
    cart: { cartItems },
  } = state;

  const threshold = 10;

  const updateCartHandler = async (item, quantity, threshold) => {
    // console.log(state);
    // console.log(quantity);

    // console.log(threshold)
    // const blower = () => {
    if (item.countInStock < 10) {
      setLowCount(true);
    }
    // }


    const { data } = await axios.get(`/db/products/id/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    // if (item.countInStock - (item.quantity + 1) <= 10) {
    //   setLowCount(true);
    // }

    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };
  const removeItemHandler = (item) => {
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
    setLowCount(false);
  };

  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };


  

  


  // console.log(cartItems)

    // console.log(state)

    const postToCart = async() => {
      try {
      
    
        const { cartThings } = await axios.post(
          '/db/addtocart',
          {
            userId: state.cart.userInfo._id,
            cartItems: state.cart.shippingAddress,
          
          },
          {
            headers: {
              authorization: `Bearer ${state.userInfo.token}`,
            },
          }
        );
      
    
      } catch (err) {
    
      }
    }
    // postToCart()










  return (
    <div>
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>
      <h1>Shopping Cart</h1>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <MessageBox>
              Cart is empty. <Link to='/'>Go Shopping</Link>
            </MessageBox>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className='align-items-center'>
                    <Col md={4}>
                      <Link className='namestyle' to={`/product/${item.slug}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className='img-fluid rounded img-thumbnail'
                      ></img>{' '}
                        {item.name}
                      </Link>
                    </Col>
                    <Col md={3}>
                      <Button
                        onClick={() => {
                          updateCartHandler(
                            item,
                            item.quantity - 1,
                            threshold - 1
                          );

                          {
                            setLowCount(false);
                          }
                        }}
                        variant='light'
                        disabled={item.quantity === 1}
                      >
                        <i className='fas fa-minus-circle'></i>
                      </Button>{' '}
                      <span>{item.quantity}</span>{' '}
                      <Button
                        variant='light'
                        onClick={() => {
                          updateCartHandler(
                            item,
                            item.quantity + 1,
                            threshold + 1
                          );
                          if (item.countInStock <= 10) {
                            setLowCount(true);
                            // console.log('d');
                          }
                        }}
                       disabled={
                          (item.countInStock - item.quantity < 10 )||
          
                          item.countInStock < 10 
                         
                        }
                      >
                        <i className='fas fa-plus-circle'></i>
                      </Button>

                    </Col>
                    <Col md={3}>${item.price} {}</Col>
                  
                    <Col md={2}>
                      <Button
                        onClick={() => removeItemHandler(item)}
                        variant='light'
                        >
                        <i className='red-bg fas fa-trash'></i>
                      </Button>
                  {
                    item.countInStock < 10  || (item.countInStock - item.quantity < 10 ) ?  (
                      <strong className='low'  md={3}>{"Low"} {}</strong>) : (null)
    
                  }
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h3>
                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    items) - $
                    {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className='d-grid'>
                    <Button
                      style={{
                        backgroundColor: 'rgb(185, 56, 14)',
                        color: 'white',
                      }}
                      className='btnred'
                      onClick={checkoutHandler}
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
