import React, { useContext, useEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Store } from "../Store";
import { getError } from "../utils";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Button from "react-bootstrap/Button";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        loadingUpload: false,
        errorUpload: "",
      };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
};
export default function RequestAdmin() {
  const navigate = useNavigate();
  const params = useParams(); // /product/:id
  const { id: productId } = params;

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });


  const [image, setImage] = useState("");
  const [experience, setExperience] = useState("");
  const [appliedBefore, setAppliedBefore] = useState("");
  const [request_text, setRequest_text] = useState("");
  const [images, setImages] = useState([]);

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(image)
console.log(experience)
console.log(appliedBefore)
console.log(request_text)
    // try {
    //   dispatch({ type: "UPDATE_REQUEST" });
    //   if(image == false || experience  == false||  request_text == false || appliedBefore == false) {
    //     alert("All field are required")
    //     return;
    //   }
    //   if (request_text.length < 5000) {
    //     alert("Essay must be at least 5000 words");
    //     return;
    //   }

    //   alert("Admin Request sent");


    //     await axios.post(
    //       `/db/users/requestadmin`,
    //       {
         
    //         experience,
    //         appliedBefore,
    //         image,
    //        request_text
    //       },
    //       {
    //         headers: { Authorization: `Bearer ${userInfo.token}` },
    //       }
    //     );
    //     dispatch({
    //       type: 'UPDATE_SUCCESS',
    //     });
    //     toast.success('Product updated successfully');
    //     navigate('/');
    // } catch (err) {
    // //   toast.error(getError(err));
    // //   dispatch({ type: "UPDATE_FAIL" });
    // }
  };


  const uploadFileHandler = async (e, forImages) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);

    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post("/db/upload", bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });

      if (forImages) {
        setImages([...images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success("Image uploaded successfully.");
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Request Admin </title>
      </Helmet>
      <h1>Apply to be an Admin</h1>

<div className="outer-pic">

      <img required src={image} className='profile-pic'  />
</div>
      <Form onSubmit={submitHandler}>
       
        <Form.Group className="mb-3" controlId="imageFile">
          <Form.Label>Upload Image of yourself</Form.Label>
          <Form.Control type="file" onChange={uploadFileHandler} />
          {loadingUpload && <LoadingBox></LoadingBox>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="additionalImage">
       
        </Form.Group>
      
        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Experience</Form.Label>
          <Form.Select
            aria-label="Category"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Less than 1 year"> Less than 1 year</option>
            <option value="1-2 Years">1-2 Years</option>
            <option value="2-5 Year">2-5 Years</option>
            <option value="Outdoor">5-10 Years</option>
            <option value="Bedroom">Over 10 years</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Have you applied for this postion before?</Form.Label>
          <Form.Select
            aria-label="Category"
          
          >
            <option value="">Select...</option>
            <option value="<1 Year"> Yes</option>
            <option value="Livingroom">No</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>
            5,000 word essay on why you want to become an admin
          </Form.Label>
          <textarea
            value={request_text}
            onChange={(e) => setRequest_text(e.target.value)}
            required
            className="notess"
          />
        </Form.Group>

        <div className="mb-3">
          <Button
            
            type="submit"
          >
            Apply
          </Button>

        </div>
      </Form>

    
    </Container>
  );
}
