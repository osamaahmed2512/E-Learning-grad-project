import React from 'react';
import { Navigate } from 'react-router-dom';
import Hero from '../../components/student/Hero';
import Companies from '../../components/student/Companies';
import CoursesSection from '../../components/student/CoursesSection';
import TestimonialsSection from '../../components/student/TestimonialsSection';
import CallToAction from '../../components/student/CallToAction';
import Footer from '../../components/student/Footer';
import { useSelector } from 'react-redux';
import Recommendation from '../../components/student/Recommendation';

const HomePage = () => {
  const { user } = useSelector((state) => state.user);

  // Handle redirects before rendering the component
  if (user?.role === "teacher") {
    return <Navigate to="/educator" replace />;
  }
  
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex flex-col items-center space-y-7 text-center">
      {/* Hero Section with fade-in and slide-down animation */}
      <div className="w-full opacity-0 translate-y-[-20px] animate-[fadeIn_1s_ease-out_forwards] transition-all duration-700">
        <Hero />
      </div>

      {/* Companies Section with fade-in and slide-up animation */}
      <div className="w-full opacity-0 translate-y-[20px] animate-[fadeIn_1s_ease-out_0.3s_forwards] transition-all duration-700">
        <Companies />
      </div>

      {/* Courses Section with fade-in and slide-up animation */}
      <div className="w-full opacity-0 translate-y-[20px] animate-[fadeIn_1s_ease-out_0.6s_forwards] transition-all duration-700">
        <CoursesSection />
      </div>

      {/* Recommendation Courses Section with fade-in and slide-up animation */}
      <div className="w-full opacity-0 translate-y-[20px] animate-[fadeIn_1s_ease-out_0.6s_forwards] transition-all duration-700">
        <Recommendation />
      </div>

      {/* Testimonials Section with fade-in and scale animation */}
      <div className="w-full opacity-0 scale-95 animate-[fadeIn_1s_ease-out_0.9s_forwards] transition-all duration-700">
        <TestimonialsSection />
      </div>

      {/* Call to Action with bounce and fade-in animation */}
      <div className="w-full opacity-0 animate-[fadeIn_1s_ease-out_1.2s_forwards] transition-all duration-700">
        <CallToAction />
      </div>

      {/* Footer with fade-in animation */}
      <div className="w-full opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards] transition-all duration-700">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;