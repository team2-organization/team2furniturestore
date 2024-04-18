import Axios from "axios";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import ListGroup from "react-bootstrap/ListGroup";
import { toast } from "react-toastify";
import { getError } from "../utils";
import { Store } from "../Store";
import CheckoutSteps from "../components/CheckoutSteps";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

const date = new Date(); // Replace this with your Date object

// Get the day, month, and year
const day = date.toDateString().split(" ")[0]; // Day of the week (e.g., "Wed")
const month = date.toDateString().split(" ")[1]; // Month (e.g., "Apr")
const dayOfMonth = date.getDate(); // Day of the month (e.g., 17)
const year = date.getFullYear(); // Full year (e.g., 2024)

const formattedDate = `${day} ${month} ${dayOfMonth} ${year} ${date.toLocaleTimeString()} GMT${
  date.getTimezoneOffset() / -60 < 0 ? "-" : "+"
}${date.getTimezoneOffset() / 60 < 10 ? "0" : ""}${Math.abs(
  date.getTimezoneOffset() / 60
)}${date.getTimezoneOffset() % 60 < 10 ? "0" : ""}${Math.abs(
  date.getTimezoneOffset() % 60
)} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
function formatMonthAndDay(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

const mynewformattedDate = formatMonthAndDay(formattedDate);
// console.log(mynewformattedDate)

export default function PlaceOrderScreen() {
  const [orderPlaced, setOrderplaced] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  // console.log(cart.cartItems)
  const userBd = state.userInfo.birthday;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;
  const renew = cart.cartItems;

  let now = {
    user_id: userInfo._id,
  };

  const takeToOrder = async () => {
    try {
      const { data } = await Axios.get(
        "/db/orders/oneorder",

        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      const orderId = data[0]._id;
      navigate(`/order/${orderId}`);
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
    }
  };

  function generateHexCode() {
    // Characters to choose from for the hexadecimal code
    const characters = "0123456789ABCDEF";
    let hexCode = "";
    // Generate 6 random characters from the characters string
    for (let i = 0; i < 6; i++) {
      hexCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return hexCode;
  }
  const discountNow = generateHexCode();
  // console.log(discountNow)

  useEffect(() => {
    if (userBd === mynewformattedDate) {
      // Define fetchDiscountCode function
      const fetchDiscountCode = async () => {
        try {
          const { data } = await Axios.post(
            "/db/orders/discount",
            {
              discountNow,
            },
            {
              headers: {
                authorization: `Bearer ${userInfo.token}`,
              },
            }
          );
          setDiscountCode(data.disCount);
          // Call toast to display success message
          toast.success(
            "🎂 Happy Birthday! We sent you a 10% discount code 🎊"
          );
        } catch (error) {
          console.error("Error fetching discount code:", error);
        }
      };

      // Delay execution of fetchDiscountCode by 1 second
      const timeoutId = setTimeout(fetchDiscountCode, 1000);


      return () => clearTimeout(timeoutId);
    }
  }, []);



  function calculateDiscount(number) {
    // Calculate 10% of the number
    const discount = number * 0.1;
    // Subtract the discount from the original number
    const discountedPrice = number - discount;
    // Return the discounted price
    return discountedPrice.toFixed(2);
  }
  //  console.log(discountCode)
  let disCountedTotal;

  const placeOrderHandler = async () => {
    setOrderLoading(true);

    // };
    setTimeout(() => {
      setOrderLoading(false);
    }, 2000); // 2000 milliseconds = 2 seconds
    // };
    setOrderplaced(true);
    // const setLoadingTrue = () => {

    try {
      dispatch({ type: "CREATE_REQUEST" });

      state.cart.cartItems.push(now);
      const data = await Axios.post(
        "/db/orders",
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: "card",
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice:
            discountCode === inputValue
              ? calculateDiscount(cart.taxPrice)
              : cart.taxPrice.toFixed(2),
          totalPrice:
            discountCode === inputValue
              ? calculateDiscount(cart.totalPrice)
              : cart.totalPrice.toFixed(2),

          quantity: {},
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      ctxDispatch({ type: "CART_CLEAR" });
      // dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem("cartItems");
      // navigate(`/order/${order._id}`);
      // navigate(`/order/${order._id}`);
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      // toast.error(getError(err));
    }
  };
  const previewtext = orderPlaced
    ? "Your order is on the way!"
    : "Preview Order";

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate("/payment");
    }
  }, [cart, navigate]);
  <MessageBox variant="success">
    {/* Order Created for {state.userInfo.name}! */}
  </MessageBox>;
  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      {/* <Helmet>
        {orderLoading === true ? <title>Preview Order</title> : <p>d</p>}
      </Helmet> */}

      {/* <h1 className='my-3'>{previewtext}</h1> */}
      {orderPlaced === true ? (
        <MessageBox variant="success">
          {" "}
          <h1 className="my-3">{previewtext}</h1>
        </MessageBox>
      ) : (
        <h1 className="my-3">{userBd === mynewformattedDate && (<p className="make-orange" >Happy Birthday! We didn't forget, enjoy 10% off 🎊</p>)}{previewtext}</h1>
      )}

      {/* {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant='danger'>{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className='mb-3'>
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )} */}
      {orderLoading ? (
        <LoadingBox />
      ) : (
        <Row>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Shipping Address</Card.Title>
                <Card.Text>
                  <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                  <strong>Address: </strong> {cart.shippingAddress.address},
                  {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}
                  ,{cart.shippingAddress.country}
                </Card.Text>
                {/* <Link to='/shipping'>Edit</Link> */}
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Payment</Card.Title>
                <Card.Text>
                  <strong>Method:</strong> Card
                </Card.Text>
                {orderPlaced === true ? (
                  <MessageBox variant="success">Order paid</MessageBox>
                ) : (
                  <Link to="/payment">Edit</Link>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                {orderPlaced === true ? (
                  <Card.Title>Confirmation email sent to</Card.Title>
                ) : (
                  <Card.Title>Items</Card.Title>
                )}

                {orderPlaced === true ? (
                  <MessageBox variant="success">
                    {state.userInfo.email}
                  </MessageBox>
                ) : (
                  <ListGroup variant="flush">
                    {cart.cartItems.map((item) => (
                      <ListGroup.Item key={item._id}>
                        <Row className="align-items-center">
                          <Col md={6}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="img-fluid rounded img-thumbnail"
                            ></img>{" "}
                            <Link to={`/product/${item.slug}`}>
                              {item.name}
                            </Link>
                          </Col>
                          <Col md={3}>
                            <span>{item.quantity}</span>
                          </Col>
                          <Col md={3}>${item.price}</Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}

                {/* <Link to='/cart'>Edit</Link> */}
              </Card.Body>
            </Card>
          </Col>

          {orderPlaced != true ? (
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Order Summary</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>Items</Col>
                        <Col>${cart.itemsPrice.toFixed(2)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Shipping</Col>
                        <Col>${cart.shippingPrice.toFixed(2)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Tax</Col>

                        <Col>
                          $
                          {(discountCode === inputValue) && inputValue
                            ? calculateDiscount(cart.taxPrice)
                            : cart.taxPrice.toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <strong> Order Total</strong>
                        </Col>
                        <Col>
                          {/* <strong>${cart.totalPrice.toFixed(2)}</strong> */}
                          <strong>
                            $
                            {(discountCode === inputValue ) && inputValue
                              ? calculateDiscount(cart.totalPrice)
                              : cart.totalPrice.toFixed(2)}
                          </strong>
                        </Col>
                      </Row>
                    </ListGroup.Item>

                    {inputValue === discountCode && inputValue && (
                      <ListGroup.Item>
                        
                        <MessageBox variant="success">
                        10% Discount Applied!
                        </MessageBox>
                      </ListGroup.Item>
                    )}

                    {userBd === mynewformattedDate && (
                      <ListGroup.Item>
                        <input
                          placeholder="Enter discount code"
                          className="notes3"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}

                          // disabled={cart.cartItems.length === 0}
                        />

                        {/* </input> */}
                      </ListGroup.Item>
                    )}

                    <ListGroup.Item>
                      {orderPlaced === true ? (
                        // <MessageBox variant='success'>
                        //   {/* Order Created for {state.userInfo.name}! */}
                        // </MessageBox>
                        <Link to="/orderhistory">
                          <Button>View Your Orders</Button>
                        </Link>
                      ) : (
                        <div className="d-grid">
                          <Button
                            type="button"
                            onClick={placeOrderHandler}
                            // disabled={cart.cartItems.length === 0}
                          >
                            Place order
                          </Button>
                        </div>
                        // {loading && <LoadingBox></LoadingBox>}
                      )}
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          ) : null}
          {orderPlaced === true ? (
            <div className="balance">
              <Button
                className="larger"
                type="button"
                // onClick={() => {
                //   navigate(`/order/${order._id}`);
                // }}
                onClick={takeToOrder}
              >
                View Order Details
              </Button>
            </div>
          ) : null}
        </Row>
      )}
    </div>
  );
}
