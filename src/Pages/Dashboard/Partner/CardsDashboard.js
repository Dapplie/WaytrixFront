import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CardsDashboard.css';
import { ipAddress } from '../../../config';

const PartnerDashboard = () => {
  const [videoData, setVideoData] = useState(null);
  const partnerToken = localStorage.getItem('partnerToken');
  const partnerId = localStorage.getItem('partnerId');
  const [totalVideos, setTotalVideos] = useState(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.post(`${ipAddress}/api/PartnerAccountRoutes/get_total_video_num`, { _id: partnerId }, {
          headers: {
            Authorization: `${partnerToken}`
          }
        });
        setVideoData(response.data);
      } catch (error) {
        console.error('Error fetching video data:', error);
      }
    };

    fetchVideoData();
  }, [partnerToken]);


  const fetchTotalVideos = async () => {
    try {
      const response = await axios.post(`${ipAddress}/api/VideoRoutes/getTotalVideosForPartner`, { partnerId });
      setTotalVideos(response.data.totalVideos); // Assuming your API returns { totalVideos: <number> }
    } catch (error) {
      console.error('Error fetching total videos:', error);
    }
  };

  fetchTotalVideos();


  return (
    <div className="partner-dashboard">
      <div className="grid-container">
        {videoData && (
          <>
            <div className="card">
              <div className="card-content">
                <h4>Total Video Number</h4>
                <p style={{ fontSize: 'clamp(24px, 5vw, 66px)', color: '#a6a6a6' }}>{totalVideos}</p>
              </div>
            </div>
            <div className="card">
              <div className="card-content">
                <h4>Total Contact Us Clicks</h4>
                <p style={{ fontSize: 'clamp(24px, 5vw, 66px)', color: '#a6a6a6' }}>{videoData.totalContactUsClicks}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PartnerDashboard;
