import React from 'react';
import TestimonialsSection from '../components/student/TestimonialsSection';
import { motion } from 'framer-motion';
import RoleBasedLayout from '../components/common/RoleBasedLayout';
// Import developer photos
import AhmedPhoto from '../assets/developers/Ahmed Abdelhamed.jpg';
import MohamedHeshamPhoto from '../assets/developers/Mohamed Hesham.jpg';
import AntonSamwelPhoto from '../assets/developers/Anton Samwel.jpg';
import OsamaSaeedPhoto from '../assets/developers/Osama Saeed.jpg';
import OsamaAhmedPhoto from '../assets/developers/Osama Ahmed.jpg';
import MohamedAtefPhoto from '../assets/developers/Mohamed Atef.jpg';

const AboutUs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardHoverVariants = {
    initial: { scale: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
    hover: {
      scale: 1.05,
      boxShadow: "0 20px 30px rgba(0,0,0,0.15)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.08,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { scale: 0.98 }
  };

  return (
    <RoleBasedLayout>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 bg-gradient-to-b from-cyan-100/70 to-cyan-50">
          {/* Hero Section */}
          <div className="bg-gray-100 text-gray-800 bg-gradient-to-b from-cyan-100/70">
            <div className="bg-[radial-gradient(circle,_rgba(37,99,235,1)_25%,_rgba(96,165,250,1)_75%)] text-white py-20 text-center">
              <h1 className="text-4xl font-bold">About Us</h1>
              <p className="mt-4 text-xl">
                We are dedicated to empowering learners and educators by providing an accessible platform designed to foster growth and collaboration.
              </p>
            </div>
          </div>

          {/* About Us Content Section */}
          <motion.div 
            className="container mx-auto text-center px-4 py-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-teal-700">
                Our Mission
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-gray-700">
                At Learnify, we believe in providing high-quality education for everyone, everywhere. 
                Our diverse team of experts works together to create an exceptional learning experience.
              </p>
            </motion.div>

            {/* Team Members Section */}
            <motion.div 
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
              variants={containerVariants}
            >
              {/* Frontend Development Team */}
              <motion.div 
                className="team-member p-8 bg-white rounded-xl"
                variants={cardHoverVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <img 
                    src={AhmedPhoto}
                    alt="Ahmed Abdelhamed"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-900">Ahmed Abdelhamed</h3>
                <p className="text-cyan-600 font-medium">Frontend Team Lead</p>
                <p className="text-gray-600 mt-2 text-sm">Specializing in React & UI Architecture</p>
              </motion.div>

              <motion.div 
                className="team-member p-8 bg-white rounded-xl"
                variants={cardHoverVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <img 
                    src={MohamedHeshamPhoto}
                    alt="Mohamed Hesham"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-900">Mohamed Hesham</h3>
                <p className="text-cyan-600 font-medium">Frontend Developer</p>
                <p className="text-gray-600 mt-2 text-sm">Expert in User Experience & Animation</p>
              </motion.div>

              {/* Machine Learning Team */}
              <motion.div 
                className="team-member p-8 bg-white rounded-xl"
                variants={cardHoverVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <img 
                    src={AntonSamwelPhoto}
                    alt="Anton Samwel"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-900">Anton Samwel</h3>
                <p className="text-cyan-600 font-medium">ML Team Lead</p>
                <p className="text-gray-600 mt-2 text-sm">AI & Machine Learning Expert</p>
              </motion.div>

              <motion.div 
                className="team-member p-8 bg-white rounded-xl"
                variants={cardHoverVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <img 
                    src={OsamaSaeedPhoto}
                    alt="Osama Saeed"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-900">Osama Saeed</h3>
                <p className="text-cyan-600 font-medium">ML Engineer</p>
                <p className="text-gray-600 mt-2 text-sm">Specializing in Deep Learning</p>
              </motion.div>

              {/* Backend Team */}

              <motion.div 
                className="team-member p-8 bg-white rounded-xl"
                variants={cardHoverVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <img 
                    src={OsamaAhmedPhoto}
                    alt="Osama Ahmed"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-900">Osama Ahmed</h3>
                <p className="text-cyan-600 font-medium">Backend Team Lead</p>
                <p className="text-gray-600 mt-2 text-sm">Database & API Expert</p>
              </motion.div>

              <motion.div 
                className="team-member p-8 bg-white rounded-xl"
                variants={cardHoverVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <img 
                    src={MohamedAtefPhoto}
                    alt="Mohamed Atef"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-900">Mohamed Atef</h3>
                <p className="text-cyan-600 font-medium">Backend Developer</p>
                <p className="text-gray-600 mt-2 text-sm">System Architecture Specialist</p>
              </motion.div>

            </motion.div>

            {/* Description Section */}
            <motion.div 
              className="max-w-3xl mx-auto mb-12"
              variants={itemVariants}
            >
              <p className="text-lg md:text-xl leading-relaxed text-gray-700">
                Our team combines expertise in Frontend Development, Machine Learning, and Backend Engineering 
                to create an innovative and efficient learning platform. Join our growing community today!
              </p>
            </motion.div>

            {/* Explore Button */}
            <motion.div
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="inline-block"
            >
              <a 
                href="/course-list" 
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg cursor-pointer"
              >
                <span className="relative flex items-center gap-2">
                  Explore Our Platform
                  <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </span>
              </a>
            </motion.div>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TestimonialsSection />
          </motion.div>
        </main>
      </div>
    </RoleBasedLayout>
  );
};

export default AboutUs;