import React from "react";

const Biography = ({ imageUrl }) => {
  return (
    <>
      <div className="container biography">
        <div className="banner">
          <img src={imageUrl} alt="whoweare" />
        </div>
        <div className="banner">
          <p>Biography</p>
          <h3>Who We Are</h3>
          <p>
            Zeecare Medical Institute is a beacon of excellence in healthcare,
            dedicated to compassionate and comprehensive services. Founded on
            patient-centered care, we blend advanced technology with skilled
            professionals across diverse medical disciplines. Our institute
            ensures personalized attention and high standards of expertise.
            Zeecare prioritizes innovation and integrity, enhancing community
            health through ongoing research and patient care advancements.
          </p>
          <p>We are all in 2024!</p>
          <p>We are working on a MERN STACK PROJECT.</p>
          <p>
            At Zeecare Medical Institute, we go beyond medical treatment. We
            create a supportive environment where patients receive holistic
            care, focusing on both physical healing and emotional well-being.
            Through preventive health initiatives and patient education, we
            empower informed choices for lasting wellness. Zeecare is your
            trusted partner in health, dedicated to enriching lives and
            promoting a healthier future.
          </p>
          <b />
          <p>Coding is fun!</p>
        </div>
      </div>
    </>
  );
};

export default Biography;
