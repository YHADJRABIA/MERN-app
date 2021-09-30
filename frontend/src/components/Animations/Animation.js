import React from "react";

const Animation = ({ content }) => {
  return (
    <div className="loading-animation">
      <i className="fas fa-cog fa-spin"></i>
      {content}
    </div>
  );
};

export default Animation;
