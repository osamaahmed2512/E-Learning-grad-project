// Created: 2025-03-16 05:35:35
// Author: AhmedAbdelhamed254

import React from "react";
import { dummyTestimonial } from "../../assets/assets";
import { assets } from "../../assets/assets";

const TestimonialsSection = () => {
  return (
    <div className="flex flex-col items-center w-full text-center">
      <div className="flex flex-col items-center gap-4 mb-12">
        <h2 className="text-4xl font-semibold text-gray-800">
          Testimonials
        </h2>
        <p className="text-gray-500 max-w-2xl px-4 sm:px-8">
          Hear from our learners as they share their journeys of transformation,
          success, and how our platform has made a difference in their lives.
        </p>
      </div>
      
      <div className="w-full px-4 sm:px-8 md:px-36">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {dummyTestimonial.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col h-[280px] sm:h-[350px] text-sm border border-gray-200 rounded-xl 
                bg-white shadow-lg shadow-gray-200/70 hover:shadow-xl 
                transition-all duration-300 hover:-translate-y-1 overflow-hidden
                mx-auto w-[80%] sm:w-full max-w-[400px]"
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-white shadow-md"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col p-4 sm:p-5">
                <div className="text-center">
                  <div className="flex gap-1 justify-center mb-2 sm:mb-3">
                    {[...Array(5)].map((_, i) => (
                      <img
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        key={i}
                        src={
                          i < Math.floor(testimonial.rating)
                            ? assets.star
                            : assets.star_blank
                        }
                        alt="star"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base line-clamp-4">
                    {testimonial.feedback}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;