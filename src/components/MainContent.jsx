import { MailIcon, MapPinIcon, PhoneIcon, UserIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const contactInfo = [
  {
    icon: PhoneIcon,
    text: "+216 12 345 789",
    iconClassName: "w-[11.22%] h-full",
  },
  {
    icon: MailIcon,
    text: "email@gmail.com",
    iconClassName: "w-[11.64%] h-[81.82%]",
  },
  {
    icon: MapPinIcon,
    text: "1000 Sousse Tunisia",
    iconClassName: "w-[26px] h-[26px]",
  },
];

export const MainContentSection = () => {
  return (
    <header className="w-full h-14 flex items-center gap-[30px] px-6 bg-[#003847] translate-y-[-1rem] animate-fade-in opacity-0">
      <div className="w-[59px] h-[22px]" />

      {contactInfo.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 translate-y-[-1rem] animate-fade-in opacity-0"
          style={{
            "--animation-delay": `${(index + 1) * 100}ms`,
          }}
        >
          <item.icon className="text-white flex-shrink-0" size={20} />
          <span className="[font-family:'Roboto',Helvetica] font-normal text-white text-lg tracking-[0] leading-8 whitespace-nowrap">
            {item.text}
          </span>
        </div>
      ))}

      <div className="flex-1" />

      <Link
        to="/login"
        className="flex items-center gap-2 translate-y-[-1rem] animate-fade-in opacity-0 hover:opacity-80 transition-opacity"
        style={{ "--animation-delay": "400ms" }}
      >
        <UserIcon className="text-white flex-shrink-0" size={16} />
        <span className="[font-family:'Roboto',Helvetica] font-normal text-white text-lg tracking-[0] leading-8 whitespace-nowrap">
          My Account
        </span>
      </Link>
    </header>
  );
};
