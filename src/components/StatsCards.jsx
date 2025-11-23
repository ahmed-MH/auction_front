import React from "react";

const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {stats.map((item, i) => (
        <div key={i} className="bg-white shadow p-6 rounded-lg border">
          <h3 className="text-lg text-gray-600">{item.title}</h3>
          <p className="text-3xl font-bold text-[#014152]">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
