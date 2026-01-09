"use client";

import React from "react";
import SideNavMain from "./includes/SideNavMain";
import TopNav from "./includes/TopNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
      	<>
			<div className="min-h-screen w-full bg-white">
				<TopNav />
				<SideNavMain />
				<div className="w-full pl-[90px] pr-4 pt-0 lg:pl-[330px]">
					{children}
				</div>
			</div>
      	</>
    )
}
  
