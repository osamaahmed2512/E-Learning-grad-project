import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaRobot, FaLightbulb, FaMapMarkedAlt, FaUserGraduate, FaMagic } from "react-icons/fa";
import RoleBasedLayout from "../components/common/RoleBasedLayout";

const PrivacyPolicy = () => {
  return (
    <RoleBasedLayout>
      <div className="bg-gray-100 text-gray-800 bg-gradient-to-b from-cyan-100/70">
        {/* Hero Section */}
        <div className="bg-[radial-gradient(circle,_rgba(37,99,235,1)_25%,_rgba(96,165,250,1)_75%)] text-white py-20 text-center">
          <h1 className="text-5xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-xl">Your privacy and data security are our top priorities.</p>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto py-16 px-8 bg-white shadow-2xl rounded-lg mt-10 mb-10 leading-relaxed text-lg">
          
          {/* Introduction */}
          <h2 className="text-3xl font-semibold mb-6">1. Introduction</h2>
          <p className="text-gray-700">
            Welcome to Learnify! We are committed to safeguarding your personal data and ensuring transparency about how we 
            collect, use, and protect your information. By using our LMS platform, you agree to the terms of this Privacy Policy.
          </p>

          {/* About Learnify & Our Technology - Creative Animated Section */}
          <div className="mt-12 mb-12 animate-fade-in-up rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100 p-8">
            <h2 className="text-3xl font-extrabold mb-4 flex items-center gap-3 text-blue-700 animate-slide-in-left">
              <FaLightbulb className="text-yellow-400 animate-bounce" /> About Learnify & Our Technology
            </h2>
            <p className="text-lg text-gray-700 mb-4 animate-fade-in">
              <strong>Learnify</strong> is more than just a learning platform—it's your smart educational companion! Our mission is to make learning personal, interactive, and effective for everyone.
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-4">
              <li className="flex items-start gap-3 animate-fade-in-delay-1">
                <FaRobot className="text-blue-500 text-2xl mt-1 animate-spin-slow" />
                <span>
                  <strong>AI-Powered Recommendation System:</strong> We use advanced algorithms to analyze your interests, learning history, and skill level. This allows us to recommend the most relevant courses and resources, so you always know what to learn next.
                </span>
              </li>
              <li className="flex items-start gap-3 animate-fade-in-delay-2">
                <FaMapMarkedAlt className="text-green-500 text-2xl mt-1 animate-pulse" />
                <span>
                  <strong>RAG System for Roadmap Chatting:</strong> Not sure where to start? Our <b>Retrieval-Augmented Generation (RAG)</b> system lets you chat with an AI assistant to build your personalized learning roadmap. Ask questions, get step-by-step guidance, and receive curated resources—all in a conversational format.
                </span>
              </li>
              <li className="flex items-start gap-3 animate-fade-in-delay-3">
                <FaUserGraduate className="text-purple-500 text-2xl mt-1 animate-bounce" />
                <span>
                  <strong>Personalized Experience:</strong> From your dashboard to your course recommendations, everything is tailored to help you achieve your goals faster and smarter.
                </span>
              </li>
              <li className="flex items-start gap-3 animate-fade-in-delay-4">
                <FaMagic className="text-pink-500 text-2xl mt-1 animate-spin-slow" />
                <span>
                  <strong>Modern, Secure, and User-Friendly:</strong> We combine the latest technology with a beautiful, intuitive interface and strong privacy protections.
                </span>
              </li>
            </ul>
            <p className="text-gray-700 mb-4 animate-fade-in-delay-5">
              Whether you're a student, a professional, or a lifelong learner, Learnify is here to support your journey. Our platform is constantly evolving, and we love hearing your feedback!
            </p>
            <p className="text-gray-700 mb-4 animate-fade-in-delay-6">
              <b>Have questions about how our technology works or want to suggest a feature?</b> Reach out to us anytime via our <Link to="/contact-us" className="text-blue-600 hover:underline">Contact Page</Link>.
            </p>
          </div>

          {/* Information We Collect */}
          <h2 className="text-3xl font-semibold mt-10 mb-6">2. Information We Collect</h2>
          <p className="text-gray-700">
            We collect various types of data to provide you with an enhanced learning experience.
          </p>

          <h3 className="text-2xl font-semibold mt-6">2.1 Personal Information</h3>
          <ul className="list-disc pl-8">
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Profile Picture (if uploaded)</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-6">2.2 Automatically Collected Data</h3>
          <ul className="list-disc pl-8">
            <li>IP Address</li>
            <li>Browser and Device Information</li>
            <li>Learning Activity and Course Progress</li>
          </ul>

          {/* How We Use Information */}
          <h2 className="text-3xl font-semibold mt-10 mb-6">3. How We Use Your Information</h2>
          <p className="text-gray-700">
            The information collected is used for the following purposes:
          </p>
          <ul className="list-disc pl-8">
          <li><strong>Improving Course Delivery:</strong> Personalizing course recommendations and tracking progress.</li>
          <li><strong>Recommendation System:</strong> Suggesting courses based on your preferences and learning history.</li>
          <li><strong>Communication:</strong> Sending important notifications, updates, and promotional offers.</li>
          <li><strong>Security & Fraud Prevention:</strong> Protecting against unauthorized access or misuse of data.</li>
      </ul>


          {/* Sharing Information */}
          <h2 className="text-3xl font-semibold mt-10 mb-6">4. Sharing Your Information</h2>
          <p className="text-gray-700">
            We do not sell or trade your personal data. However, we may share your information in the following cases:
          </p>
          <ul className="list-disc pl-8">
            <li>With trusted third-party service providers that help us operate our LMS.</li>
            <li>In response to legal requests or compliance with regulations.</li>
            <li>If Learnify undergoes a business transaction such as a merger or acquisition.</li>
          </ul>

          {/* Data Security */}
          <h2 className="text-3xl font-semibold mt-10 mb-6">5. Data Security</h2>
          <p className="text-gray-700">
            We implement strict security measures, including encryption and secure servers, to protect your data.
          </p>
          <h3 className="text-2xl font-semibold mt-6">5.1 User Responsibilities</h3>
          <p>
            We encourage users to follow best practices for securing their accounts, including:
          </p>
          <ul className="list-disc pl-8">
            <li>Using strong, unique passwords</li>
            <li>Avoiding sharing login credentials</li>
          </ul>

          {/* Your Rights */}
          <h2 className="text-3xl font-semibold mt-10 mb-6">6. Your Rights</h2>
          <p className="text-gray-700">
            You have the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-8">
            <li><strong>Right to Access:</strong> Request details on how your data is used.</li>
            <li><strong>Right to Update:</strong> Modify or correct inaccurate information.</li>
            <li><strong>Right to Delete:</strong> Request removal of personal data.</li>
            <li><strong>Right to Restrict Processing:</strong> Limit how your data is used in specific cases.</li>
          </ul>

          {/* Cookies and Tracking */}
          <h2 className="text-3xl font-semibold mt-10 mb-6">7. Cookies and Tracking</h2>
          <p className="text-gray-700">
            We use cookies to enhance user experience. These may be used to store session data, preferences, and track usage 
            patterns for analytical purposes.
          </p>

          <h3 className="text-2xl font-semibold mt-6">7.1 Managing Cookies</h3>
          <p>
            You can control or disable cookies through your browser settings. However, disabling cookies may affect platform 
            functionality.
          </p>

          {/* Policy Updates */}
          <h2 className="text-3xl font-semibold mt-10 mb-6">8. Updates to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. Significant changes will be communicated via email or 
            announcements on our platform.
          </p>

          {/* Contact Section */}
          <h2 className="text-3xl font-semibold mt-10 mb-6">9. Contact Us</h2>
          <p className="text-gray-700 mb-5">
            If you have any questions or concerns regarding this Privacy Policy, please contact us at:
          </p>
          <ul className="list-none pl-8">
          <li><strong>Contact Us:</strong> <Link to="/contact-us" className="text-blue-600 hover:underline">Visit our Contact Page</Link></li>
          <li className="flex items-center gap-2 text-black">
              <FaEnvelope className="text-xl" />
              <span><strong>Email:</strong> support@learnify.com</span>
            </li>
            <li className="flex items-center gap-2 text-black">
              <FaPhoneAlt className="text-xl" />
              <span><strong>Phone:</strong> +1 234 567 890</span>
            </li>
            <li className="flex items-center gap-2 text-black">
              <FaMapMarkerAlt className="text-xl" />
              <span><strong>Address:</strong> 123 Learnify Street, Giza, Egypt</span>
            </li>
          </ul>
        </div>
      </div>
    </RoleBasedLayout>
  );
};

export default PrivacyPolicy;

/* Add animation keyframes for fade-in and slide-in */
const styles = document.createElement("style");
styles.textContent = `
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
  .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.4,0,0.2,1) both; }
  .animate-slide-in-left { animation: slideInLeft 0.7s cubic-bezier(0.4,0,0.2,1) both; }
  .animate-fade-in { animation: fadeInUp 1s 0.2s both; }
  .animate-fade-in-delay-1 { animation: fadeInUp 1s 0.4s both; }
  .animate-fade-in-delay-2 { animation: fadeInUp 1s 0.6s both; }
  .animate-fade-in-delay-3 { animation: fadeInUp 1s 0.8s both; }
  .animate-fade-in-delay-4 { animation: fadeInUp 1s 1s both; }
  .animate-fade-in-delay-5 { animation: fadeInUp 1s 1.2s both; }
  .animate-fade-in-delay-6 { animation: fadeInUp 1s 1.4s both; }
  .animate-spin-slow { animation: spin 2.5s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(styles);
