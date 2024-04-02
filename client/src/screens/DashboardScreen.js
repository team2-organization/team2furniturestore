import React, { useContext, useEffect, useReducer, useState } from 'react';
import Chart from 'react-google-charts';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


import Card from 'react-bootstrap/Card';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export default function DashboardScreen() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/db/orders/summary', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);
let usernamesArray = [];
if(summary && summary.users  ) {
 usernamesArray = summary.users.map(obj => obj.username);

}

const transformedArray = usernamesArray.map(username => ({
  orders: [],
  info: username
}));


const [firstSelection, setFirstSelection] = useState('');
const [secondSelection, setSecondSelection] = useState('');
const [thirdSelection, setThirdSelection] = useState('');
const [fourthSelection, setFourthSelection] = useState('');


const firstOptions = ['Sales / Transactions', 'Users', 'Refunds'];
const secondOptions = {
  'Sales / Transactions': ['Best Selling Category', 'Worst Selling Category', 'Best selling product', 'Worst selling product', 'Highest Transactions', 'Lowest Transactions'],
  'Users': usernamesArray,
  'Refunds': ['Approved', 'Denied']
};
// console.log(secondSelection)
const thirdOptions = {
  'Best Selling Category': ['All time','Today', 'Last week', 'Last month', 'Last Year'],
  'Highest Transactions':  ['All time','Today', 'Last week', 'Last month', 'Last Year'],
  'Lowest Transactions':  ['All time','Today', 'Last week', 'Last month', 'Last Year'],
  'Worst Selling Category': ['All time','Today', 'Last week', 'Last month', 'Last Year'],
  'Best selling product': ['All time','Today', 'Last week', 'Last month', 'Last Year'],
  'Worst selling product': ['All time','Today', 'Last week', 'Last month', 'Last Year'],
  secondSelection: transformedArray,
  'Approved': ['Today', 'Last week', 'Last month', 'Last year'],
  'Denied': ['Today', 'Last week', 'Last month', 'Last year']
};
const userOptions = ["All Orders", 'All Reviews', 'All Refund Requests', 'Highest transactions', 'Lowest Transactions']


// console.log(thirdOptions[secondSelection])
// console.log(secondSelection)
// console.log(secondSelection)


const handleFirstChange = (event) => {
  const { value } = event.target;
  setFirstSelection(value);
  // Reset selections when first dropdown changes
  setSecondSelection('');
  setThirdSelection('');
  setFourthSelection('');
};

// Event handler for second dropdown
const handleSecondChange = (event) => {
  const { value } = event.target;
  setSecondSelection(value);
  // Reset selections when second dropdown changes
  setThirdSelection('');
  setFourthSelection('');
};

// Event handler for third dropdown
const handleThirdChange = (event) => {
  const { value } = event.target;
  setThirdSelection(value);

  // Reset fourth selection when third dropdown changes
  setFourthSelection('');
};

// Event handler for fourth dropdown
const handleFourthChange = (event) => {
  const { value } = event.target;
  setFourthSelection(value);
};
  const catChart = [
    {_id: "Bedroom", count: 45},
    {_id: "Dining", count: 25},
    {_id: "Kitchen", count: 13},
    {_id: "Livingroom", count: 39},
    {_id: "Outdoor", count: 6},
  ]

  return (
    <div>
      <h1>Dashboard</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <>
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.users && summary.users[0]
                      ? summary.users.length
                      : 0}
                  </Card.Title>
                  <Card.Text> Users</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.orders && summary.orders[0]
                      ? summary.orders[0].numOrders
                      : 0}
                  </Card.Title>
                  <Card.Text> Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    $
                    {summary.orders && summary.orders[0]
                      ? summary.orders[0].totalSales.toFixed(2)
                      : 0}
                  </Card.Title>
                  <Card.Text> Total Sales</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>


          <div className='my-3'>
          <h2>Customize Report</h2>
          <Form>
              <Card>
                <Card.Body>
                  <Row>
                  <Col>
                  
                  {/* <Card.Text> Users</Card.Text> */}
                  {/* <Form> */}
                  <Form.Group className='mb-3' controlId='category'>
          <Form.Label>Criteria I</Form.Label>
          <Form.Select
            aria-label='Category'
            value={firstSelection}
            onChange={handleFirstChange}
          >
            <option value=''>Select...</option>
            {firstOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
          </Form.Select>
        </Form.Group>
                  </Col>
                  <Col>
                  {firstSelection && (
                  <Form.Group className='mb-3' controlId='category'>
        
          <Form.Label>Criteria II</Form.Label>
          <Form.Select
            aria-label='Category'
            value={secondSelection}
            onChange={handleSecondChange}
          >
            <option value=''>Select...</option>
            {secondOptions[firstSelection].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
          </Form.Select>
      
        </Form.Group>
                  )}      
               
                  </Col>
                

                  <Col>
                  {secondSelection && (
                  <Form.Group className='mb-3' controlId='category'>
        
          <Form.Label>Criteria III</Form.Label>

          {
            firstSelection !== "Users" ? (

          <Form.Select
            aria-label='Category'
            value={thirdSelection}
            onChange={handleThirdChange}
          >
            <option value=''>Select...</option>
            
            {thirdOptions[secondSelection].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
          </Form.Select>):(  <Form.Select
            aria-label='Category'
            value={thirdSelection}
            onChange={handleThirdChange}
          >
            <option value=''>Select...</option>
            
            {userOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
          </Form.Select>)
          }
      
        </Form.Group>
                  )}      
               
               
          </Col>   <Col>
                  {thirdSelection && (
                  <Form.Group className='mb-3' controlId='category'>
        
          <Form.Label>Go</Form.Label>
          <div className="mb-3">
            <Button type="submit">
              Find
            </Button>
       
          </div>  
      
        </Form.Group>


// </Form>

)}     
            
                  </Col>
                  </Row>
                </Card.Body>
              </Card>
              </Form>
          </div>
          <div className='my-3'>
            <h2>Sales</h2>
            {summary.dailyOrders.length === 0 ? (
              <MessageBox>No Sale</MessageBox>
            ) : (
              <Chart
                width='100%'
                height='400px'
                chartType='AreaChart'
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Date', 'Sales'],
                  ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                ]}
              ></Chart>
            )}
          </div>
          <div className='my-3'>
            <h2>Categories</h2>
            {summary.productCategories.length === 0 ? (
              <MessageBox>No Category</MessageBox>
            ) : (
              <Chart
                width='100%'
                height='400px'
                chartType='PieChart'
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Category', 'Products'],
                  ...summary.productCategories.map((x) => [x._id, x.count]),
                ]}
              ></Chart>
            )}
          </div>
        </>
      )}
    </div>
  );
}
