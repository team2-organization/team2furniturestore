import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';



export default function PaymentMethodScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentMethod },
  } = state;
  

  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'PayPal'
  );



   const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [missing, setMissing] = useState(false)

  const handleCardNumberChange = (e) => {
    setCardNumber(e.target.value);
  };

  const handleCardNameChange = (e) => {
    setCardName(e.target.value);
  };

  const handleExpiryChange = (e) => {
    setExpiry(e.target.value);
  };

  const handleCvvChange = (e) => {
    setCvv(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
    localStorage.setItem('paymentMethod', paymentMethodName);
    if(!cardNumber || !cardName || !expiry || !cvv) {
      setMissing(true)
      return;
    }
    navigate('/placeorder');
  };
  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        <Helmet>
          <title>Payment Method</title>
        </Helmet>
        <h1 className="my-3">Payment Method</h1>
        <Form onSubmit={submitHandler}>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="PayPal"
              label="Card"
              value="PayPal"
              checked={paymentMethodName === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          
          {/* <PaymentCard
      bank="itau"
      model="personnalite"
      type="black"
      brand="mastercard"
      number="4111111111111111"
      cvv="202"
      holderName="Owen Lars"
      expiration="12/20"
      flipped={false}
    /> */}
          {/* <div className="mb-3">
            <Form.Check
              type="radio"
              id="Stripe"
              label="Stripe"
              value="Stripe"
              checked={paymentMethodName === 'Stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div> */}
          <div className="mb-3">

{

<p style={{"color":"red"}}>All fields are required! Card Number, Expiry date and CVV Must be numbers  </p>
}
{/* <CardPaymentForm/> */}
<form className="form-container" onSubmit={handleSubmit}>
  
      <div>
        <label>Card Number:</label>
        <input type="number" required  value={cardNumber} onChange={handleCardNumberChange} />
      </div>
      <div>
        <label>Name on Card:</label>
        <input required type="text" value={cardName} onChange={handleCardNameChange} />
      </div>
      <div>
        <label>Expiry Date:</label>
        <input required className='inp' placeholder='MM/YY'  value={expiry} onChange={handleExpiryChange} />
      </div>
      <div>
        <label>CVV:</label>
        <input required className='inp ' maxlength="3" placeholder='CVV' type="number" value={cvv} onChange={handleCvvChange} />
      </div>

    </form>
            <Button className='orderbtn' type="submit">Continue</Button>
           <img className='accepted' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZa9stluxuArfKQHtToXyOJoDSyNgmHsLOrA&usqp=CAU'/>
          </div>
        </Form>
      </div>
    </div>
  );
}
