import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { IoMdClose } from "react-icons/io";

import FormControl from 'react-bootstrap/FormControl';
import { useNavigate } from 'react-router-dom';

export default function Reports(props) {
//   const navigate = useNavigate();
//   const [query, setQuery] = useState('');
//   const submitHandler = (e) => {
//     e.preventDefault();
//     navigate(query ? `/search/?query=${query}` : '/search');
//   };
const {setShowReport, showReport} = props
console.log(showReport)

  return (
   <div className='main-report'>



    <IoMdClose  onClick={setShowReport(false)}  className='close-out'/>
    
   </div>
  );
}
