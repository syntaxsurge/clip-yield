"use client";

import React from "react";
import SideNavMain from "./includes/SideNavMain";
import TopNav from "./includes/TopNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
      	<>
			<TopNav/>
			<div className="flex justify-between mx-auto w-full max-w-[1150px] lg:px-2.5 px-0">
				<SideNavMain />
				{children}
			</div>
      	</>
    )
}
  
