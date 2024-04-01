import axios from 'axios';
import React, { useContext, useEffect, useState, useReducer } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import Axios from "axios"
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import { MdFullscreen } from 'react-icons/md';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };

    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      return state;
  }
}
export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });
  const [paymentStatus, setPaymentStatus] = useState('Not Delivered');
  const [paymentColor, setPaymentColor] = useState('danger');
const [refundNote, setRefundNote] = useState("")
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
const [optionsCheck, setOptionsCheck] = useState("")
  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }
  const hide = optionsCheck.options ===null || optionsCheck.refundnote != null ? "hidden" : "mb-3"

  useEffect(() => {
   
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/db/orders/refunds/options/${orderId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        setOptionsCheck(data); // Update data state with fetched data
        // dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, []);


  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `/db/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success('Order is paid');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }
  function onError(err) {
    toast.error(getError(err));
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPaymentStatus('Delivered');
      setPaymentColor('success');
    }, 5000);

    // Clean up the timeout to avoid memory leaks
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array means this effect runs once after the initial render

  useEffect(
    () => {
      const fetchOrder = async () => {
        try {
          dispatch({ type: 'FETCH_REQUEST' });
          const { data } = await axios.get(`/db/orders/${orderId}`, {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (err) {
          dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
        }
      };

      if (!userInfo) {
        return navigate('/login');
      }
      if (
        !order._id ||
        successPay ||
        successDeliver ||
        (order._id && order._id !== orderId)
      ) {
        fetchOrder();
        if (successPay) {
          dispatch({ type: 'PAY_RESET' });
        }
        if (successDeliver) {
          dispatch({ type: 'DELIVER_RESET' });
        }
      } else {
        const loadPaypalScript = async () => {
          const { data: clientId } = await axios.get('/db/keys/paypal', {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          paypalDispatch({
            type: 'resetOptions',
            value: {
              'client-id': clientId,
              currency: 'USD',
            },
          });
          paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
        };
        loadPaypalScript();
      }
    },
    // [
    //   order,
    //   userInfo,
    //   orderId,
    //   navigate,
    //   paypalDispatch,
    //   successPay,
    //   successDeliver,
    // ]
    []
  );


  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `/db/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is delivered');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }
  const change = (ordering) => {
    const dateString = ordering;
    const dateObject = new Date(dateString);

    // Get month, day, and year from the date object
    const month = dateObject.getMonth() + 1; // Months are zero-indexed, so add 1
    const day = dateObject.getDate();
    const year = dateObject.getFullYear();

    // Format month and day with leading zeros if necessary
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;

    // Create the formatted date string in "MM DD YYYY" format
    const formattedDate = `${formattedMonth}-${formattedDay}-${year}`;
    return formattedDate;
  };

  // console.log(refundNote)
  const handleRefund = async () => {
    if(refundNote === "") {
      // setOptionsCheck("")
      alert("You must leave a refund note")
      return;
    }
 
    
    const { order } = await Axios.post(
      '/db/orders/refund',
      {
        orderId:orderId,
        name:userInfo.name,
        note: refundNote,
        email:userInfo.email,



        
      },
      {
        headers: {
          authorization: `Bearer ${userInfo.token}`,
        },
      }
      );
      // console.log(orderId)
      setRefundNote("")
    window.location.reload();

    
  }

  // console.log(optionsCheck)
  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant='danger'>{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className='my-3'>Order for {order.user_name} - Order No: {orderId} </h1>
      <Row>
        <Col md={8}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Summary</Card.Title>
          <p> Total - <strong> ${order.totalPrice} </strong> </p> 
          <p> items Price - <strong> ${order.itemsPrice} </strong> </p> 
          <p> Tax - <strong>  ${order.taxPrice} </strong> </p> 
          Order created on {change(order.createdAt)}

             
            </Card.Body>
          </Card>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
            
              {order.isDelivered ? (
                <MessageBox variant='success'>
                  Will be delivered in 3-5 Business Days
                </MessageBox>
              ) : (
                <MessageBox variant={paymentColor}>{paymentStatus}</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Payment</Card.Title>

              <Card.Text>
                <strong>Method:</strong> Credit Card
              </Card.Text>
              {order.isPaid ? (
                // <MessageBox variant='success'>
                <span>


                  Paid on {change(order.createdAt)}

                </span>
                // </MessageBox>
              ) : (
                <MessageBox variant='success'> Paid</MessageBox>
              )}
            </Card.Body>
          </Card>

 {

optionsCheck.options === null ? (

  <Card className='mb-3'>
    <Card.Body>
      <Card.Title>Refund Decision</Card.Title>
      <Card.Text>
        <strong>Status</strong> 
      </Card.Text>
  
        <MessageBox >
          pending...
        </MessageBox>
  
  
  
    </Card.Body>
  </Card>
  ): (
    
  null
  )
  

 }
  {

optionsCheck.options === "true" ? (

  <Card className='mb-3'>
    <Card.Body>
      <Card.Title>Refund Decision</Card.Title>
      <Card.Text>
        <strong>Status</strong> 
      </Card.Text>
  
        <MessageBox variant='success'>
          Approved by Admin <strong>{optionsCheck.admin}</strong>
        </MessageBox>
  
  
  
    </Card.Body>
  </Card>
  ): (
    
  null
  )
  

 }
  {

optionsCheck.options === "false" ? (

  <Card className='mb-3'>
    <Card.Body>
      <Card.Title>Refund Decision</Card.Title>
      <Card.Text>
        <strong>Status</strong> 
      </Card.Text>
  
        <MessageBox variant='danger'>
         Denied by Admin <strong>{optionsCheck.admin}</strong>
        </MessageBox>
  
  
  
    </Card.Body>
  </Card>
  ): (
    
  null
  )
  

 }
      
        <Card aria-disabled className={hide}>
            <Card.Body>

              <Card.Title>Request Refund</Card.Title>
            <textarea required placeholder='Leave a refund note' className='notes' value={refundNote}   onChange={(e) => setRefundNote(e.target.value)}/>
            
              {order.isDelivered ? (
                <Button onClick={handleRefund}>
                 Request Refund
                </Button>
              ) : (
                <MessageBox variant={paymentColor}>{paymentStatus}</MessageBox>
              )}
              
            </Card.Body>
          </Card>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant='flush'>
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className='align-items-center'>
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='img-fluid rounded img-thumbnail'
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* <Col md={4}>
          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${order.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {!order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <div>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                )}
                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    <div className='d-grid'>
                      <Button type='button' onClick={deliverOrderHandler}>
                        Deliver Order
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col> */}
      </Row>
    </div>
  );
}
