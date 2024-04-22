import React, { useContext, useEffect, useReducer, useState } from "react";
import Chart from "react-google-charts";
import axios from "axios";
import { Store } from "../Store";
import { getError } from "../utils";
import LoadingBox from "../components/LoadingBox";
import { IoMdClose } from "react-icons/io";
import { usePDF } from 'react-to-pdf';

import MessageBox from "../components/MessageBox";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Reports from "../components/Reports";
import Form from "react-bootstrap/Form";

import Card from "react-bootstrap/Card";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export default function DashboardScreen() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [reportData, setReportData] = useState([]);
  const { toPDF, targetRef } = usePDF({filename: 'page.pdf'});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/db/orders/summary", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);
  let usernamesArray = [];
  if (summary && summary.users) {
    usernamesArray = summary.users.map((obj) => obj.username);
  }

  const transformedArray = usernamesArray.map((username) => ({
    orders: [],
    info: username,
  }));

  const [firstSelection, setFirstSelection] = useState("");
  const [secondSelection, setSecondSelection] = useState("");
  const [thirdSelection, setThirdSelection] = useState("");
  const [fourthSelection, setFourthSelection] = useState("");
  const [showReport, setShowReport] = useState(false);

  const firstOptions = ["Products / Categories", 
  "Users", 
  // "Refunds"
];
  const secondOptions = {
    "Products / Categories": [
      "Best Selling Category",
      "Worst Selling Category",
      "Best selling product",
      "Worst selling product",
      "Highest Transactions",
      "Lowest Transactions",
    ],
    Users: usernamesArray,
    Refunds: ["Approved", "Denied"],
  };
  // console.log(secondSelection)
  const thirdOptions = {
    "Best Selling Category": [
      "All time",
      "Today",
      "Last week",
      "Last month",
      "Last Year",
    ],
    "Highest Transactions": [
      "All time",
      "Today",
      "Last week",
      "Last month",
      "Last Year",
    ],
    "Lowest Transactions": [
      "All time",
      "Today",
      "Last week",
      "Last month",
      "Last Year",
    ],
    "Worst Selling Category": [
      "All time",
      "Today",
      "Last week",
      "Last month",
      "Last Year",
    ],
    "Best selling product": [
      "All time",
      "Today",
      "Last week",
      "Last month",
      "Last Year",
    ],
    "Worst selling product": [
      "All time",
      "Today",
      "Last week",
      "Last month",
      "Last Year",
    ],
    secondSelection: transformedArray,
    Approved: ["Today", "Last week", "Last month", "Last year"],
    Denied: ["Today", "Last week", "Last month", "Last year"],
  };
  const userOptions = [
    "All Orders",
    "Highest transactions",
    "Lowest Transactions",
  ];

  // console.log(thirdOptions[secondSelection])
  // console.log(secondSelection)
  // console.log(secondSelection)

  const handleFirstChange = (event) => {
    const { value } = event.target;
    setFirstSelection(value);
    // Reset selections when first dropdown changes
    setSecondSelection("");
    setThirdSelection("");
    setFourthSelection("");
  };

  // Event handler for second dropdown
  const handleSecondChange = (event) => {
    const { value } = event.target;
    setSecondSelection(value);
    // Reset selections when second dropdown changes
    setThirdSelection("");
    setFourthSelection("");
  };

  // Event handler for third dropdown
  const handleThirdChange = (event) => {
    const { value } = event.target;
    setThirdSelection(value);

    // Reset fourth selection when third dropdown changes
    setFourthSelection("");
  };

  // Event handler for fourth dropdown
  const handleFourthChange = (event) => {
    const { value } = event.target;
    setFourthSelection(value);
  };
  const catChart = [
    { _id: "Bedroom", count: 45 },
    { _id: "Dining", count: 25 },
    { _id: "Kitchen", count: 13 },
    { _id: "Livingroom", count: 39 },
    { _id: "Outdoor", count: 6 },
  ];

  const reportHandler = async (e) => {
    setShowReport(true);

    try {
      dispatch({ type: "FETCH_REQUEST" });
      const { data } = await axios.post(
        `/db/reports`,
        {
          firstSelection,
          secondSelection,
          thirdSelection,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "FETCH_SUCCESS", payload: data });
      setReportData(data.newArr);
    } catch (err) {
      dispatch({
        type: "FETCH_FAIL",
        payload: getError(err),
      });
    }
  };

  const reversedData = reportData ? reportData.slice().reverse() : [];

  const frequency = {};

  // Loop through the array to count the frequency of each item
  reversedData.forEach((item) => {
    frequency[item] = (frequency[item] || 0) + 1;
  });

  // Find the most common item and its frequency
  let mostCommonItem;
  let maxFrequency = 0;

  for (const key in frequency) {
    if (frequency[key] > maxFrequency) {
      mostCommonItem = key;
      maxFrequency = frequency[key];
    }
  }

  let least = "";
  let leastNum = "";

  function leastFrequent(array, num) {
    var hash = new Map();
    for (var i = 0; i < num; i++) {
      if (hash.has(array[i])) {
        hash.set(array[i], hash.get(array[i]) + 1);
      } else {
        hash.set(array[i], 1);
      }
    }

    // Find the least frequent value using hash map function
    var countMin = num + 1,
      leastCountNum = -1;
    hash.forEach((value, key) => {
      if (countMin >= value) {
        countMin = value;
        leastCountNum = key;
      }
    });

    // Count the occurrences of the least frequent value in the array
    var leastCount = 0;
    array.forEach((item) => {
      if (item === leastCountNum) {
        leastCount++;
      }
    });

    return { leastCountNum, leastCount };
  }

  var num = 8;
  const result = leastFrequent(reversedData, num);
  least = result.leastCountNum;
  leastNum = result.leastCount;


  let smallestNumber = 0
if (secondSelection === "Lowest Transactions") {

  function sortAndReturnSmallest(numbers) {
    // Sort the array of numbers in ascending order
    numbers.sort((a, b) => a - b);
  
    // Return the smallest number (first element of the sorted array)
    return numbers[0];
  }
  

  
  smallestNumber = sortAndReturnSmallest(reportData);
}
if (thirdSelection === "Lowest Transactions") {

  function sortAndReturnSmallest(numbers) {
    // Sort the array of numbers in ascending order
    numbers.sort((a, b) => a - b);
  
    // Return the smallest number (first element of the sorted array)
    return numbers[0];
  }
  

  
  smallestNumber = sortAndReturnSmallest(reportData);
}

  
let highestNumber = 0
if (secondSelection === "Highest Transactions") {

  function sortAndReturnHighest(numbers) {
    // Sort the array of numbers in descending order
    numbers.sort((a, b) => b - a);
  
    // Return the highest number (first element of the sorted array)
    return numbers[0];
  }
  
  
  highestNumber = sortAndReturnHighest(reportData);

}  
if (thirdSelection === "Highest transactions") {

  function sortAndReturnHighest(numbers) {
    // Sort the array of numbers in descending order
    numbers.sort((a, b) => b - a);
  
    // Return the highest number (first element of the sorted array)
    return numbers[0];
  }
  
  
  highestNumber = sortAndReturnHighest(reportData);

}  


  

  return (
    <>
      {showReport === false ? (
        <div>
          <h1>Dashboard</h1>
          {loading ? (
            <LoadingBox />
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
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

              <div className="my-3">
                <h2>Customize Report</h2>
                <Form>
                  <Card>
                    <Card.Body>
                      <Row>
                        <Col>
                          {/* <Card.Text> Users</Card.Text> */}
                          {/* <Form> */}
                          <Form.Group className="mb-3" controlId="category">
                            <Form.Label>Criteria I</Form.Label>
                            <Form.Select
                              aria-label="Category"
                              value={firstSelection}
                              onChange={handleFirstChange}
                            >
                              <option value="">Select...</option>
                              {firstOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col>
                          {firstSelection && (
                            <Form.Group className="mb-3" controlId="category">
                              <Form.Label>Criteria II</Form.Label>
                              <Form.Select
                                aria-label="Category"
                                value={secondSelection}
                                onChange={handleSecondChange}
                              >
                                <option value="">Select...</option>
                                {secondOptions[firstSelection].map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          )}
                        </Col>
                        <Col>
                          {secondSelection && (
                            <Form.Group className="mb-3" controlId="category">
                              <Form.Label>Criteria III</Form.Label>

                              {firstSelection !== "Users" ? (
                                <Form.Select
                                  aria-label="Category"
                                  value={thirdSelection}
                                  onChange={handleThirdChange}
                                >
                                  <option value="">Select...</option>

                                  {thirdOptions[secondSelection].map(
                                    (option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    )
                                  )}
                                </Form.Select>
                              ) : (
                                <Form.Select
                                  aria-label="Category"
                                  value={thirdSelection}
                                  onChange={handleThirdChange}
                                >
                                  <option value="">Select...</option>

                                  {userOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </Form.Select>
                              )}
                            </Form.Group>
                          )}
                        </Col>{" "}
                        <Col>
                          {thirdSelection && (
                            <Form.Group className="mb-3" controlId="category">
                              <Form.Label>Submit</Form.Label>
                              <div className="mb-3">
                                <Button onClick={reportHandler()}>
                                  Generate Live Report
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
              <div className="my-3">
                <h2>Sales</h2>
                {summary.dailyOrders.length === 0 ? (
                  <MessageBox>No Sale</MessageBox>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="AreaChart"
                    loader={<div>Loading Chart...</div>}
                    data={[
                      ["Date", "Sales"],
                      ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                    ]}
                  ></Chart>
                )}
              </div>
              {/* <div className="my-3">
                <h2>Categories</h2>
                {summary.productCategories.length === 0 ? (
                  <MessageBox>No Category</MessageBox>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="PieChart"
                    loader={<div>Loading Chart...</div>}
                    data={[
                      ["Category", "Products"],
                      ...summary.productCategories.map((x) => [x._id, x.count]),
                    ]}
                  ></Chart>
                )}
              </div> */}
            </>
          )}
        </div>
      ) : (
        <div ref={targetRef}  className="main-report">
          <div  className="main-middle">
            <IoMdClose
              onClick={() => window.location.reload()}
              className="close-out"
            />
            <h2>
              {" "}
              Live Report for {firstSelection} | {secondSelection} |{" "}
              {thirdSelection}
            </h2>

            <Button onClick={() => toPDF()} className="rightt">Download Report</Button>
          </div>

          {firstSelection === "Products / Categories" &&
            secondSelection === "Best Selling Category" &&
            thirdSelection === "All time" && (
              <>
                <p className="report-info">
                  The All Time Best Selling Category{" "}
                  <strong> {mostCommonItem}</strong> -{" "}
                  <strong>{maxFrequency}</strong> Items from this Catgory have
                  been purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
            
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
    
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          {firstSelection === "Products / Categories" &&
            secondSelection === "Best Selling Category" &&
            thirdSelection === "Last week" && (
              <>
                <p className="report-info">
                  The Best Selling Category Last week is{" "}
                  <strong> {mostCommonItem}</strong> -{" "}
                  <strong>{maxFrequency}</strong> Items from this Catgory have
                  been purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Best Selling Category" &&
            thirdSelection === "Today" && (
              <>
                <p className="report-info">
                  The Best Selling Category Today is{" "}
                  <strong> {mostCommonItem}</strong> -{" "}
                  <strong>{maxFrequency}</strong> Items from this Catgory have
                  been purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Best Selling Category" &&
            thirdSelection === "Last month" && (
              <>
                <p className="report-info">
                  The Best Selling Category Last month{" "}
                  <strong> {mostCommonItem}</strong> -{" "}
                  <strong>{maxFrequency}</strong> Items from this Catgory have
                  been purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Best Selling Category" &&
            thirdSelection === "Last Year" && (
              <>
                <p className="report-info">
                  The Best Selling Category Last year{" "}
                  <strong> {mostCommonItem}</strong> -{" "}
                  <strong>{maxFrequency}</strong> Items from this Catgory have
                  been purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst Selling Category" &&
            thirdSelection === "Last week" && (
              <>
                <p className="report-info">
                  The Least Selling Category Last week is{" "}
                  <strong> {least}</strong> - Only
                  <strong>{leastNum}</strong> Items from this Category have been
                  purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst Selling Category" &&
            thirdSelection === "Today" && (
              <>
                <p className="report-info">
                  The Least Selling Category Today is <strong> {least}</strong>{" "}
                  - Only
                  <strong>{leastNum}</strong> Items from this Category have been
                  purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst Selling Category" &&
            thirdSelection === "All time" && (
              <>
                <p className="report-info">
                  The Least Selling Category of All time is{" "}
                  <strong> {least}</strong> - Only
                  <strong>{leastNum}</strong> Items from this Category have been
                  purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst Selling Category" &&
            thirdSelection === "Last month" && (
              <>
                <p className="report-info">
                  The Least Selling Category Last Months{" "}
                  <strong> {least}</strong> - Only
                  <strong>{leastNum}</strong> Items from this Category have been
                  purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst Selling Category" &&
            thirdSelection === "Last Year" && (
              <>
                <p className="report-info">
                  The Least Selling Category last year is{" "}
                  <strong> {least}</strong> - Only
                  <strong>{leastNum}</strong> Items from this Category have been
                  purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Best selling product" &&
            thirdSelection === "All time" && (
              <>
                <p className="report-info">
                  The Best Selling Product of all Time is{" "}
                  <strong> {mostCommonItem}</strong> - This Product has been
                  purchased <strong>{maxFrequency}</strong> times
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Best selling product" &&
            thirdSelection === "Today" && (
              <>
                <p className="report-info">
                  The Best Selling Product of Today{" "}
                  <strong> {mostCommonItem}</strong> - This Product has been
                  purchased <strong>{maxFrequency}</strong> times
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Best selling product" &&
            thirdSelection === "Last month" && (
              <>
                <p className="report-info">
                  The Best Selling Product of the month is{" "}
                  <strong> {mostCommonItem}</strong> - This Product has been
                  purchased <strong>{maxFrequency}</strong> times
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Best selling product" &&
            thirdSelection === "Last week" && (
              <>
                <p className="report-info">
                  The Best Selling Product of the week is{" "}
                  <strong> {mostCommonItem}</strong> - This Product has been
                  purchased <strong>{maxFrequency}</strong> times
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Best selling product" &&
            thirdSelection === "Last Year" && (
              <>
                <p className="report-info">
                  The Best Selling Product of the Year is{" "}
                  <strong> {mostCommonItem}</strong> - This Product has been
                  purchased <strong>{maxFrequency}</strong> times
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td
                            className={
                              mostCommonItem === category ? "make-main" : ""
                            }
                          >
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst selling product" &&
            thirdSelection === "Last week" && (
              <>
                <p className="report-info">
                  The Least Selling Product Last week is{" "}
                  <strong> {least}</strong> - Only
                  <strong>{leastNum}</strong>of this product were purchased
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst selling product" &&
            thirdSelection === "Today" && (
              <>
                <p className="report-info">
                  The Least Selling Product Today is <strong> {least}</strong>{" "}
                  - Only
                  <strong>{leastNum}</strong> of this product have been purchased
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst selling product" &&
            thirdSelection === "All time" && (
              <>
                <p className="report-info">
                  The Least Selling Product of All time is{" "}
                  <strong> {least}</strong> - Only
                  <strong>{leastNum}</strong> of this product have been
                  purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>

                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst selling product" &&
            thirdSelection === "Last month" && (
              <>
                <p className="report-info">
                  The Least Selling Product Last Month is{" "}
                  <strong> {least}</strong> - Only
                  <strong>{leastNum}</strong> of this products were purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Worst selling product" &&
            thirdSelection === "Last Year" && (
              <>
                <p className="report-info">
                  The Least Selling Product last year is{" "}
                  <strong> {least}</strong> - Only
                  <strong>{leastNum}</strong> of this product have been
                  purchased{" "}
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reversedData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={least === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Highest Transactions" &&
            thirdSelection === "All time" && (
              <>
                <p className="report-info">
                  The biggest Sale of All time is Worth{" "}
                  <strong> ${highestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={highestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          {firstSelection === "Products / Categories" &&
            secondSelection === "Highest Transactions" &&
            thirdSelection === "Today" && (
              <>
                <p className="report-info">
                  The biggest Sale of Today is Worth{" "}
                  <strong> ${highestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={highestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Products / Categories" &&
            secondSelection === "Highest Transactions" &&
            thirdSelection === "Last week" && (
              <>
                <p className="report-info">
                  The biggest Sale of Last week is worth{" "}
                  <strong> ${highestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={highestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Products / Categories" &&
            secondSelection === "Highest Transactions" &&
            thirdSelection === "Last month" && (
              <>
                <p className="report-info">
                  The biggest Sale of Last month is worth{" "}
                  <strong> ${highestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={highestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Products / Categories" &&
            secondSelection === "Highest Transactions" &&
            thirdSelection === "Last Year" && (
              <>
                <p className="report-info">
                  The biggest Sale of Last Year is worth{" "}
                  <strong> ${highestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={highestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Products / Categories" &&
            secondSelection === "Lowest Transactions" &&
            thirdSelection === "All time" && (
              <>
                <p className="report-info">
                  The smallest sale of All time is worth{" "}
                  <strong> ${smallestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={smallestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Products / Categories" &&
            secondSelection === "Lowest Transactions" &&
            thirdSelection === "Last month" && (
              <>
                <p className="report-info">
                  The smallest sale of last month is worth{" "}
                  <strong> ${smallestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={smallestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Products / Categories" &&
            secondSelection === "Lowest Transactions" &&
            thirdSelection === "Today" && (
              <>
                <p className="report-info">
                  The smallest sale of Today is worth{" "}
                  <strong> ${smallestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={smallestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Products / Categories" &&
            secondSelection === "Lowest Transactions" &&
            thirdSelection === "Last week" && (
              <>
                <p className="report-info">
                  The smallest sale of last week is worth{" "}
                  <strong> ${smallestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={smallestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Products / Categories" &&
            secondSelection === "Lowest Transactions" &&
            thirdSelection === "Last Year" && (
              <>
                <p className="report-info">
                  The smallest sale of last year is worth{" "}
                  <strong> ${smallestNumber}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={smallestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Users" &&
            // secondSelection === "Lowest Transactions" &&
            thirdSelection === "All Orders" && (
              <>
                <p className="report-info">
                 All Orders for
                  <strong> {secondSelection}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={smallestNumber === category ? "make-main" : ""}>
                            {category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Users" &&
            // secondSelection === "Lowest Transactions" &&
            thirdSelection === "Lowest Transactions" && (
              <>
                <p className="report-info">
                Lowest Transactions for
                  <strong> {secondSelection}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={smallestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
               {firstSelection === "Users" &&
            // secondSelection === "Lowest Transactions" &&
            thirdSelection === "Highest transactions" && (
              <>
                <p className="report-info">
                Highest transactions for
                  <strong> {secondSelection}</strong> 
                </p>
                <div className="table-container">
                  <table className="centered-table">
                    <thead>
                      <tr>
                        <th>Index</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((category, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className={highestNumber === category ? "make-main" : ""}>
                            ${category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
        </div>
      )}
    </>
  );
}