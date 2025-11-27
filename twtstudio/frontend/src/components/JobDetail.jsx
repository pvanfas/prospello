import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jobAPI } from '../lib/api';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobAPI.getJob(id);
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return <div>Loading job details...</div>;
  }

  if (!job) {
    return <div>Job not found!</div>;
  }

  return (
    <div>
      <h1>{job.title}</h1>
      <p>{job.description}</p>
      <p>Location: {job.location}</p>
    </div>
  );
};

export default JobDetail;

