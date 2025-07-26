import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="" />
          <p className="w-full md:w-2/3 text-gray-600">
            Dreams Clothing brings you the latest in fashion with trendy,
            high-quality clothing for every occasion. Discover stylish
            collections, enjoy a seamless shopping experience, and express your
            unique style effortlessly. Fast shipping, exclusive deals, and
            hassle-free returns await you!
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <Link to="/">
              <li>Home</li>
            </Link>
            <Link to="/collection">
              <li>Collection</li>
            </Link>
            <Link to="/about">
              <li>About us</li>
            </Link>
            <Link to="/contact">
              <li>Contact</li>
            </Link>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91 96246 34498</li>
            <li>contact@dreamscothing.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2024@ dreamscothing.com - All Right Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
