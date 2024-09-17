import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Multer from '../../WaytrixAccount/AddVideo/multer/multer';

const AddVideoSeq = () => {
  const location = useLocation();

  const [formData, setFormData] = useState({
    videoURL: '',

   
    partnerId: '',
    uploadDate: '',
    duration: 0
  });

  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getQueryParams = (query) => {
    return new URLSearchParams(query);
  };

  const queryParams = getQueryParams(location.search);
  const restoId = queryParams.get('id');

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const waytrixToken = localStorage.getItem('waytrixToken');
        const { data } = await axios.get('https://waytrixback.onrender.com/api/PartnerAccountRoutes/get_partners', {
          headers: {
            Authorization: waytrixToken
          }
        });
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
      }
    };

    fetchPartners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePartnerChange = (partnerId) => {
    setSelectedPartner(partnerId);
    setFormData({ ...formData, partnerId });
  };

  const calculateVideoDuration = (videoURL) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoURL;
      video.addEventListener('loadedmetadata', () => {
        resolve(video.duration); // Duration in seconds
      });
      video.addEventListener('error', () => {
        reject(new Error('Failed to load video metadata'));
      });
    });
  };

  const fetchTotalVideoLength = async () => {
    try {
      const waytrixToken = localStorage.getItem('waytrixToken');
      
      // Send POST request with restoId in the request body
      const { data } = await axios.post('https://waytrixback.onrender.com/api/Auth/videos-length', {
        restoId: restoId // Send restoId in the request body
      }, {
        headers: {
          Authorization: waytrixToken
        }
      });
  
      console.log('API response:', data); // Debugging line
      return data.totalDuration; // Adjust to match API response field
    } catch (error) {
      console.error('Error fetching total video length:', error);
      return 0; // Fallback value if the request fails
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const videoDuration = await calculateVideoDuration(formData.videoURL);
      console.log('Calculated video duration:', videoDuration); // Debugging line
  
      const totalLength = await fetchTotalVideoLength();
      console.log('Total video length:', totalLength); // Debugging line
  
      if (totalLength + videoDuration > 3600) { // 3600 seconds = 1 hour
        setErrorMessage('Cannot add more videos. The total length exceeds one hour.');
        console.error('Error: Total video length exceeds one hour.'); // Debugging line
        return;
      }
  
      const waytrixToken = localStorage.getItem('waytrixToken');
      const { data } = await axios.post('https://waytrixback.onrender.com/api/VideoRoutes/AddVideo', {
        videoURL: formData.videoURL,
        restoId: restoId,
    
        Displayed: 0,
        partnerId: formData.partnerId,
        uploadDate: formData.uploadDate,
        duration: videoDuration,
        rushHour: formData.rushHour // Include rushHour here
      }, {
        headers: {
          Authorization: waytrixToken
        }
      });
  
      console.log('Response:', data);
      setShowModal(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000); // Redirect after 3 seconds
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred while adding the video.');
    }
  };
  
  

  return (
    <div className="form-container">
      <Multer />
      <h1 className="title">Upload Advertisement</h1>
      <form className="luxurious-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label" htmlFor="videoURL">
            Enter Video URL:
          </label>
          <center>
            <input
              className="input"
              type="text"
              id="videoURL"
              name="videoURL"
              value={formData.videoURL}
              onChange={handleChange}
            />
          </center>
        </div>
       
        
        <div className="form-group">
          <label className="label" htmlFor="uploadDate">
            Select Upload Date:
          </label>
          <center>
            <input
              className="input"
              type="date"
              id="uploadDate"
              name="uploadDate"
              value={formData.uploadDate}
              onChange={handleChange}
            />
          </center>
        </div>
        <div className="form-group">
          <label className="label" htmlFor="rushHour">
            Tick if Rush Hour (1PM-3PM):
          </label>
          <center>
            <input
              className="checkbox"
              type="checkbox"
              id="rushHour"
              name="rushHour"
              checked={formData.rushHour}
              onChange={(e) =>
                setFormData({ ...formData, rushHour: e.target.checked })
              }
            />
          </center>
        </div>
        <div className="grid-container-c">
          <label className="labelc">Select Partner:</label>
          {partners.map((partner) => (
            <div key={partner._id} className="grid-itemc">
              <input
                type="checkbox"
                id={`partner-${partner._id}`}
                name="partner"
                value={partner._id}
                checked={selectedPartner === partner._id}
                onChange={() => handlePartnerChange(partner._id)}
              />
              <label htmlFor={`partner-${partner._id}`}>{partner.name}</label>
            </div>
          ))}
        </div>
        <button className="submit-btn" type="submit">
          Upload Video
        </button>
      </form>
      {showModal && (
        <div className="modal">
          <p style={{ color: "white", fontWeight: "bold" }}>
            Advertisement added successfully!
          </p>
        </div>
      )}
      {errorMessage && (
        <div className="error-message">
          <p style={{ color: "red" }}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AddVideoSeq;
