import React, { useContext, useEffect, useReducer,useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        loadingCreate: false,
      };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };

    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

export default function Restock() {
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [countInStock, setCountInStock] = useState('');
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/db/products/admin?page=${page} `, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, []);

 




  const submitHandler = async (e) => {
     
    e.preventDefault();
    try {
        const productId = e.target.id

        const value = countInStock[Object.keys(countInStock)[0]];
   setCountInStock("")
        if(value < 10) {
            alert("Restock Quantity must be greater than 10")
            return;
        }


      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.post(
        `/db/products/restock/${productId}`,

        {
      
        
          value
                
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
        window.location.reload()

      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      toast.success('Product updated successfully');

    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };
  
  
  const reversedData = products ? products.slice().reverse() : [];
  
  const lessThan10Stock = reversedData.filter((reversedData) => reversedData.countInStock < 10) ;

  return (
    <div>
      <Row>
        <Col>
          <h1>Restock Products</h1>
        </Col>
    
      </Row>

      {loadingCreate && <LoadingBox></LoadingBox>}
      {loadingDelete && <LoadingBox></LoadingBox>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <>
          <table className='table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>Count</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {lessThan10Stock.map((product) => (
                <tr key={product._id}>
                  <td >{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td style={{"color" : "red"}}>{product.countInStock}</td>
                  <td>
                    {/* <Input
                      type='button'
                      variant='light'
                      onClick={() => navigate(`/admin/product/${product._id}`)}
                    >
                      Edit
                    </Input> */}
               <form>
  <label>
    {/* Name: */}
    <input 
  value={countInStock[product._id] || ''} // Get count in stock for the current product
  onChange={(e) => setCountInStock({...countInStock, [product._id]: e.target.value})} // Update count in stock for the current product
  required 
  className='push' 
  type="number" 
  name="name" 
/>
  </label>

  <   Button id={product._id} onClick={submitHandler}>Restock</Button>
</form>
                    &nbsp;
                
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                key={x + 1}
                to={`/admin/products?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
