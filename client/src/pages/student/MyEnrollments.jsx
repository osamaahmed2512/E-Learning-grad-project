/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { Line } from 'rc-progress';
import Footer from "../../components/student/Footer";
import axios from "axios";

const MyEnrollments = () => {
  const { navigate } = useContext(AppContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = 'https://learnify.runasp.net';

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/Subscription/GetUserSubscribedCourses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.status_code === 200) {
          setEnrolledCourses(response.data.data);
        } else {
          setError('Failed to fetch enrolled courses');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching courses');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="md:px-36 px-8 pt-10 pb-10">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>
        <table className="md:table-auto table-fixed w-full overflow-hidden mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Duration</th>
              <th className="px-4 py-3 font-semibold truncate">Progress</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {enrolledCourses.map((course) => (
              <tr key={course.course_id} className="border-b border-gray-500/20">
                <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                  <img
                    src={`${BASE_URL}${course.course_image}`}
                    alt={course.course_title}
                    className="w-14 sm:w-24 md:w-28 object-cover"
                  />
                  <div className="flex-1">
                    <p className="mb-1 max-sm:text-sm">{course.course_title}</p>
                    <Line
                      strokeWidth={2}
                      percent={course.progress_percentage}
                      className="bg-gray-300 rounded-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 max-sm:hidden">
                  {course.total_hours} Hours
                </td>
                <td className="px-4 py-3 max-sm:hidden">
                  {course.lectures_progress}
                </td>
                <td className="px-4 py-3 max-sm:text-right">
                  <button
                    onClick={() => navigate(`/player/${course.course_id}`)}
                    className={`px-3 sm:px-5 py-1.5 sm:py-2 ${course.status === 'Completed' ? 'bg-green-600' : 'bg-blue-600'
                      } max-sm:text-xs text-white cursor-pointer hover:bg-sky-700`}
                  >
                    {course.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
};

export default MyEnrollments;
