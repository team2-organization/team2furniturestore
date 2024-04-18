import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default function SignupScreen() {
  const [startDate, setStartDate] = useState(new Date());
  function formatMonthAndDay2(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
}


const mynewformattedDate2 = formatMonthAndDay2(startDate);
// console.log(mynewformattedDate2)



  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
 

    try {
      const { data } = await Axios.post('/db/users/signup', {
        name,
        email,
        username,
        password,
        mynewformattedDate2,
      });

     

  if( data.error && data.error.errno === 1062) {
    toast.error("Email or username is aready taken. Try again")
return;
}
navigate("/signin");
toast.success('Account Created! Now sign in');
    } catch (err) {
      toast.error(getError(err));
    }

  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);
  // console.log(Date.now())
  const date = new Date(); // Replace this with your Date object

// Get the day, month, and year
const day = date.toDateString().split(' ')[0]; // Day of the week (e.g., "Wed")
const month = date.toDateString().split(' ')[1]; // Month (e.g., "Apr")
const dayOfMonth = date.getDate(); // Day of the month (e.g., 17)
const year = date.getFullYear(); // Full year (e.g., 2024)

// Construct the desired format
// const formattedDate = `${day} ${month} ${dayOfMonth} ${year} ${date.toLocaleTimeString()} GMT${date.getTimezoneOffset() / -60 < 0 ? '-' : '+'}${(date.getTimezoneOffset() / 60) < 10 ? '0' : ''}${Math.abs(date.getTimezoneOffset() / 60)}${(date.getTimezoneOffset() % 60) < 10 ? '0' : ''}${Math.abs(date.getTimezoneOffset() % 60)} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;


//   function formatMonthAndDay(dateString) {
//     const date = new Date(dateString);
//     const month = date.toLocaleString('default', { month: 'short' });
//     const day = date.getDate();
//     return `${month} ${day}`;
// }


// const mynewformattedDate = formatMonthAndDay(formattedDate);
// console.log(mynewformattedDate)



// function formatMonthAndDay2(dateString) {
//   const date = new Date(dateString);
//   const month = date.toLocaleString('default', { month: 'short' });
//   const day = date.getDate();
//   return `${month} ${day}`;
// }


// const mynewformattedDate2 = formatMonthAndDay2(startDate);
// console.log(mynewformattedDate2)








  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <h1 className="my-3">Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Username</Form.Label>
          <Form.Control
           
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>
         
          <p>When is your birthday</p>

      <DatePicker required className="date-picker" selected={startDate} onChange={(date) => setStartDate(date)} />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Sign Up</Button>
        </div>
        <div className="mb-3">
          Already have an account?{' '}
          <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
        </div>
      </Form>

    </Container>
  );
}
// AGDK9Y91VYWM587M91WPH32F