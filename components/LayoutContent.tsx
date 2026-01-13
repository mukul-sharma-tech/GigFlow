// "use client";

// import { usePathname } from "next/navigation";
// import Sidebar from "./Sidebar";

// interface LayoutContentProps {
//   children: React.ReactNode;
// }

// export default function LayoutContent({ children }: LayoutContentProps) {
//   const pathname = usePathname();

//   const isAuthPage = ['/', '/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'].includes(pathname);

//   return (
//     <div className={`min-h-screen ${isAuthPage ? 'bg-gradient-to-br from-slate-50 to-slate-100' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'}`}>
//       {/* Background effects */}
//       {!isAuthPage && (
//         <div className="fixed inset-0 pointer-events-none">
//           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900/30 via-transparent to-slate-800/30" />
//           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-600/8 rounded-full blur-3xl" />
//           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-700/8 rounded-full blur-3xl" />
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-transparent via-slate-500/3 to-transparent rounded-full blur-3xl" />
//         </div>
//       )}

//       <div className={`relative z-10 ${isAuthPage ? '' : 'flex min-h-screen'}`}>
//         {/* Sidebar */}
//         {!isAuthPage && <Sidebar />}

//         {/* Main Content */}
//         <main className={`${isAuthPage ? '' : 'flex-1 overflow-y-auto p-4 lg:p-6'}`}>
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();

  const isAuthPage = [
    "/",
    "/login",
    "/signup",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ].includes(pathname);

  return (
    <div
      className={`min-h-screen ${
        isAuthPage
          ? "bg-gradient-to-br from-slate-50 to-slate-100"
          : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      }`}
    >
      {/* Background effects */}
      {!isAuthPage && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-transparent to-slate-800/30" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-700/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Layout wrapper */}
      <div
        className={`relative z-10 ${
          isAuthPage ? "" : "flex h-screen overflow-hidden"
        }`}
      >
        {/* Sidebar */}
        {!isAuthPage && <Sidebar />}

        {/* Main Content (ONLY this scrolls) */}
        <main
          className={`flex-1 ${
            isAuthPage ? "" : "lg:ml-64"
          } overflow-y-auto p-3 sm:p-4 lg:p-6`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
