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
export default function RefundScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [data, setData] = useState(null); // Define data state
  const [note, setNote] = useState(""); // Define data state

  const params = useParams();
  const id = params;
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
   






  const approveRef = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.post(
        `/db/orders/refunds/decison/${note._id}`,
        {
          deci: "true",
         
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      toast.success('Refund Decision Sent');
      navigate('/admin/refunds');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };

  const denyRef = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.post(
        `/db/orders/refunds/nodecison/${note._id}`,
        {
          deci: "false",
         
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      toast.success('Refund Decision Sent');
      navigate('/admin/refunds');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };



   useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/db/orders/refunds/${id.id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        setData(data); // Update data state with fetched data
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


  useEffect(() => {
    const fetchNote = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/db/orders/refunds/note/${id.id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // console.log(note);
        setNote(data); // Update data state with fetched data
        // dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchNote();
  }, []);

  
  return  (
    <div>
    <Helmet>
      <title>Order</title>
    </Helmet>

    <h1 className='my-3'>Refunds Tab </h1>
   
    <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Order ID</Card.Title>
            
  
               
                {data && data._id && ( // Check if data and data._id are not null
        <h1 className='my-3'>{data._id}</h1>
      )}
             
            </Card.Body>
          </Card>

          <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Total Price</Card.Title>
              
            
  
               
                {data && data._id && ( // Check if data and data._id are not null
        <h1 className='my-3'>${data.totalPrice}</h1>
      )}
             
            </Card.Body>
          </Card> <Card className='mb-3'>
            <Card.Body>
              <Card.Title>Customer</Card.Title>
              
            
  
               
                {data && data._id && ( // Check if data and data._id are not null
        <h1 className='my-3'>{data.user_name}</h1>
      )}
             
            </Card.Body>
          </Card> <Card className='mb-3'>

            {
                
                note != "" ? (
            <Card.Body>
              <Card.Title>Refund Note</Card.Title>
            
  
               
                {data && data._id && ( // Check if data and data._id are not null
        <p className='my-3'>{note.refundnote}</p>
      )}
             
            </Card.Body>):null
            }
          </Card>


<div className='approve'>
    
<Button onClick={denyRef} style={{"backgroundColor": "red"}} >
            Deny Refund
          </Button>
          <Button onClick={approveRef} style={{"backgroundColor": "green"}} >
Approve Refund
          </Button>
   
</div>
   
  </div>
 
  );
}
